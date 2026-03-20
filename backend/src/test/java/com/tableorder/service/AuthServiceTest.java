package com.tableorder.service;

import com.tableorder.dto.response.LoginResponse;
import com.tableorder.dto.response.TableLoginResponse;
import com.tableorder.entity.Store;
import com.tableorder.entity.TableEntity;
import com.tableorder.entity.TableSession;
import com.tableorder.exception.UnauthorizedException;
import com.tableorder.repository.StoreRepository;
import com.tableorder.repository.TableRepository;
import com.tableorder.repository.TableSessionRepository;
import com.tableorder.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock StoreRepository storeRepository;
    @Mock TableRepository tableRepository;
    @Mock TableSessionRepository tableSessionRepository;
    @Mock JwtProvider jwtProvider;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AuthService authService;

    private Store store;
    private TableEntity table;

    @BeforeEach
    void setUp() {
        store = Store.builder()
                .storeIdentifier("store001")
                .name("테스트 매장")
                .adminUsername("admin")
                .adminPassword("encoded_password")
                .build();

        table = TableEntity.builder()
                .store(store)
                .tableNumber(1)
                .password("1234")
                .build();
    }

    // TC-BE-001
    @Test
    @DisplayName("유효한 자격증명으로 관리자 로그인 성공")
    void login_success() {
        given(storeRepository.findByStoreIdentifier("store001")).willReturn(Optional.of(store));
        given(passwordEncoder.matches("password", "encoded_password")).willReturn(true);
        given(jwtProvider.generateAdminToken(any(), eq("admin"))).willReturn("admin-token");

        LoginResponse response = authService.login("store001", "admin", "password");

        assertThat(response.token()).isEqualTo("admin-token");
        assertThat(response.storeName()).isEqualTo("테스트 매장");
    }

    // TC-BE-002
    @Test
    @DisplayName("존재하지 않는 매장으로 로그인 실패")
    void login_storeNotFound_throwsException() {
        given(storeRepository.findByStoreIdentifier("unknown")).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("unknown", "admin", "password"))
                .isInstanceOf(UnauthorizedException.class);
    }

    // TC-BE-003
    @Test
    @DisplayName("잘못된 비밀번호로 로그인 실패")
    void login_wrongPassword_throwsException() {
        given(storeRepository.findByStoreIdentifier("store001")).willReturn(Optional.of(store));
        given(passwordEncoder.matches("wrong", "encoded_password")).willReturn(false);

        assertThatThrownBy(() -> authService.login("store001", "admin", "wrong"))
                .isInstanceOf(UnauthorizedException.class);
    }

    // TC-BE-004
    @Test
    @DisplayName("테이블 로그인 성공 - 신규 세션 생성")
    void tableLogin_newSession_success() {
        given(storeRepository.findByStoreIdentifier("store001")).willReturn(Optional.of(store));
        given(tableRepository.findByStoreIdAndTableNumber(any(), eq(1))).willReturn(Optional.of(table));
        given(tableSessionRepository.findByTableIdAndIsActiveTrue(any())).willReturn(Optional.empty());
        given(tableSessionRepository.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(jwtProvider.generateTableToken(any(), any(), any())).willReturn("table-token");

        TableLoginResponse response = authService.tableLogin("store001", 1, "1234");

        assertThat(response.token()).isEqualTo("table-token");
        assertThat(response.tableNumber()).isEqualTo(1);
        then(tableSessionRepository).should().save(any(TableSession.class));
    }

    // TC-BE-005
    @Test
    @DisplayName("테이블 로그인 성공 - 기존 활성 세션 재사용")
    void tableLogin_existingSession_reused() {
        TableSession existingSession = TableSession.builder().table(table).build();
        given(storeRepository.findByStoreIdentifier("store001")).willReturn(Optional.of(store));
        given(tableRepository.findByStoreIdAndTableNumber(any(), eq(1))).willReturn(Optional.of(table));
        given(tableSessionRepository.findByTableIdAndIsActiveTrue(any())).willReturn(Optional.of(existingSession));
        given(jwtProvider.generateTableToken(any(), any(), any())).willReturn("table-token");

        authService.tableLogin("store001", 1, "1234");

        then(tableSessionRepository).should(never()).save(any(TableSession.class));
    }

    // TC-BE-006
    @Test
    @DisplayName("잘못된 테이블 비밀번호로 로그인 실패")
    void tableLogin_wrongPassword_throwsException() {
        given(storeRepository.findByStoreIdentifier("store001")).willReturn(Optional.of(store));
        given(tableRepository.findByStoreIdAndTableNumber(any(), eq(1))).willReturn(Optional.of(table));

        assertThatThrownBy(() -> authService.tableLogin("store001", 1, "wrong"))
                .isInstanceOf(UnauthorizedException.class);
    }
}
