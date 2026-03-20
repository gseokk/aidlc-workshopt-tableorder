package com.tableorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tableorder.dto.request.LoginRequest;
import com.tableorder.dto.response.LoginResponse;
import com.tableorder.exception.UnauthorizedException;
import com.tableorder.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(com.tableorder.config.SecurityConfig.class)
@org.springframework.test.context.ActiveProfiles("test")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean com.tableorder.security.JwtProvider jwtProvider;
    @MockBean com.tableorder.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    // TC-BE-027
    @Test
    @DisplayName("POST /api/auth/login - 로그인 성공 200")
    void login_success_200() throws Exception {
        given(authService.login(any(), any(), any()))
                .willReturn(new LoginResponse("token", 1L, "테스트 매장"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("store001", "admin", "password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"))
                .andExpect(jsonPath("$.storeName").value("테스트 매장"));
    }

    // TC-BE-028
    @Test
    @DisplayName("POST /api/auth/login - 인증 실패 401")
    void login_failure_401() throws Exception {
        given(authService.login(any(), any(), any()))
                .willThrow(new UnauthorizedException("인증 실패"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("store001", "admin", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }
}
