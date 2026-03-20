package com.tableorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tableorder.dto.request.OrderCreateRequest;
import com.tableorder.dto.request.OrderItemRequest;
import com.tableorder.dto.request.OrderStatusRequest;
import com.tableorder.dto.response.OrderResponse;
import com.tableorder.entity.OrderStatus;
import com.tableorder.security.AdminClaims;
import com.tableorder.security.JwtAuthenticationFilter;
import com.tableorder.security.JwtProvider;
import com.tableorder.security.TableClaims;
import com.tableorder.service.OrderService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import(com.tableorder.config.SecurityConfig.class)
@org.springframework.test.context.ActiveProfiles("test")
class OrderControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean OrderService orderService;
    @MockBean JwtProvider jwtProvider;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;

    // TC-BE-032
    @Test
    @DisplayName("POST /api/customer/orders - 주문 생성 201")
    void createOrder_201() throws Exception {
        TableClaims claims = new TableClaims(1L, 1L, 1L);
        var auth = new UsernamePasswordAuthenticationToken(
                claims, null, List.of(new SimpleGrantedAuthority("ROLE_TABLE")));

        OrderResponse response = new OrderResponse(1L, 1L, 1, OrderStatus.PENDING,
                8000, List.of(), LocalDateTime.now());
        given(orderService.createOrder(any(), any(), any())).willReturn(response);

        mockMvc.perform(post("/api/customer/orders")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new OrderCreateRequest(List.of(new OrderItemRequest(1L, 2))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value(8000));
    }

    // TC-BE-033
    @Test
    @DisplayName("PATCH /api/admin/orders/{id}/status - 상태 변경 200")
    void updateOrderStatus_200() throws Exception {
        AdminClaims claims = new AdminClaims(1L, "admin");
        var auth = new UsernamePasswordAuthenticationToken(
                claims, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        OrderResponse response = new OrderResponse(1L, 1L, 1, OrderStatus.CONFIRMED,
                8000, List.of(), LocalDateTime.now());
        given(orderService.updateOrderStatus(any(), any(), any())).willReturn(response);

        mockMvc.perform(patch("/api/admin/orders/1/status")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new OrderStatusRequest(OrderStatus.CONFIRMED))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }
}
