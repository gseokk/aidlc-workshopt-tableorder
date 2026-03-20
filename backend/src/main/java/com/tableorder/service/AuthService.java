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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StoreRepository storeRepository;
    private final TableRepository tableRepository;
    private final TableSessionRepository tableSessionRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(String storeIdentifier, String username, String password) {
        Store store = storeRepository.findByStoreIdentifier(storeIdentifier)
                .orElseThrow(() -> new UnauthorizedException("매장을 찾을 수 없습니다"));
        if (!store.getAdminUsername().equals(username) ||
                !passwordEncoder.matches(password, store.getAdminPassword())) {
            throw new UnauthorizedException("인증 실패");
        }
        String token = jwtProvider.generateAdminToken(store.getId(), username);
        long expiresAt = System.currentTimeMillis() + jwtProvider.getAdminExpiration();
        return new LoginResponse(token, store.getId(), store.getName(), expiresAt);
    }

    @Transactional
    public TableLoginResponse tableLogin(String storeIdentifier, Integer tableNumber, String password) {
        Store store = storeRepository.findByStoreIdentifier(storeIdentifier)
                .orElseThrow(() -> new UnauthorizedException("매장을 찾을 수 없습니다"));
        TableEntity table = tableRepository.findByStoreIdAndTableNumber(store.getId(), tableNumber)
                .orElseThrow(() -> new UnauthorizedException("테이블을 찾을 수 없습니다"));
        if (!table.getPassword().equals(password)) {
            throw new UnauthorizedException("비밀번호가 올바르지 않습니다");
        }
        TableSession session = tableSessionRepository.findByTableIdAndIsActiveTrue(table.getId())
                .orElseGet(() -> tableSessionRepository.save(TableSession.builder().table(table).build()));
        String token = jwtProvider.generateTableToken(table.getId(), store.getId(), session.getId());
        return new TableLoginResponse(token, table.getId(), table.getTableNumber(), session.getId(), store.getId(), store.getName());
    }
}
