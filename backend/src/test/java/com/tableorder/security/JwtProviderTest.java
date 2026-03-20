package com.tableorder.security;

import com.tableorder.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class JwtProviderTest {

    private JwtProvider jwtProvider;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(
                "test-secret-key-minimum-32-characters-long",
                28800000L,  // 8시간
                43200000L   // 12시간
        );
    }

    @Test
    @DisplayName("관리자 토큰 생성 및 검증")
    void generateAdminToken_success() {
        String token = jwtProvider.generateAdminToken(1L, "admin");

        assertThat(token).isNotBlank();
        assertThat(jwtProvider.getTokenType(token)).isEqualTo("ADMIN");

        var claims = jwtProvider.validateToken(token);
        AdminClaims adminClaims = jwtProvider.extractAdminClaims(claims);
        assertThat(adminClaims.storeId()).isEqualTo(1L);
        assertThat(adminClaims.username()).isEqualTo("admin");
    }

    @Test
    @DisplayName("테이블 토큰 생성 및 검증")
    void generateTableToken_success() {
        String token = jwtProvider.generateTableToken(2L, 1L, 10L);

        assertThat(token).isNotBlank();
        assertThat(jwtProvider.getTokenType(token)).isEqualTo("TABLE");

        var claims = jwtProvider.validateToken(token);
        TableClaims tableClaims = jwtProvider.extractTableClaims(claims);
        assertThat(tableClaims.tableId()).isEqualTo(2L);
        assertThat(tableClaims.storeId()).isEqualTo(1L);
        assertThat(tableClaims.sessionId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("만료된 토큰 검증 시 UnauthorizedException 발생")
    void validateToken_expired_throwsException() {
        JwtProvider expiredProvider = new JwtProvider(
                "test-secret-key-minimum-32-characters-long",
                1L,  // 1ms - 즉시 만료
                1L
        );
        String token = expiredProvider.generateAdminToken(1L, "admin");

        // 만료 대기
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}

        assertThatThrownBy(() -> expiredProvider.validateToken(token))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("잘못된 토큰 검증 시 UnauthorizedException 발생")
    void validateToken_invalid_throwsException() {
        assertThatThrownBy(() -> jwtProvider.validateToken("invalid.token.here"))
                .isInstanceOf(UnauthorizedException.class);
    }
}
