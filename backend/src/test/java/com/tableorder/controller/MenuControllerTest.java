package com.tableorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tableorder.dto.request.MenuCreateRequest;
import com.tableorder.dto.response.MenuResponse;
import com.tableorder.security.AdminClaims;
import com.tableorder.security.JwtAuthenticationFilter;
import com.tableorder.security.JwtProvider;
import com.tableorder.security.TableClaims;
import com.tableorder.service.MenuService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MenuController.class)
@Import(com.tableorder.config.SecurityConfig.class)
@org.springframework.test.context.ActiveProfiles("test")
class MenuControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean MenuService menuService;
    @MockBean JwtProvider jwtProvider;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;

    // TC-BE-029
    @Test
    @DisplayName("GET /api/customer/menus - 인증 없이 접근 시 403")
    void getMenus_noAuth_403() throws Exception {
        mockMvc.perform(get("/api/customer/menus"))
                .andExpect(status().isForbidden());
    }

    // TC-BE-030
    @Test
    @DisplayName("GET /api/customer/menus - Table Token으로 접근 성공 200")
    void getMenus_withTableToken_200() throws Exception {
        TableClaims claims = new TableClaims(1L, 1L, 1L);
        var auth = new UsernamePasswordAuthenticationToken(
                claims, null, List.of(new SimpleGrantedAuthority("ROLE_TABLE")));

        given(menuService.getMenusByCategory(any(), any())).willReturn(List.of());

        mockMvc.perform(get("/api/customer/menus")
                        .with(authentication(auth)))
                .andExpect(status().isOk());
    }

    // TC-BE-031
    @Test
    @DisplayName("POST /api/admin/menus - Admin JWT로 메뉴 등록 201")
    void createMenu_withAdminJwt_201() throws Exception {
        AdminClaims claims = new AdminClaims(1L, "admin");
        var auth = new UsernamePasswordAuthenticationToken(
                claims, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        MenuResponse response = new MenuResponse(1L, "아메리카노", 4000, "음료", null, null, 1);
        given(menuService.createMenu(any(), any())).willReturn(response);

        mockMvc.perform(post("/api/admin/menus")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new MenuCreateRequest("아메리카노", 4000, "음료", null, null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("아메리카노"))
                .andExpect(jsonPath("$.price").value(4000));
    }
}
