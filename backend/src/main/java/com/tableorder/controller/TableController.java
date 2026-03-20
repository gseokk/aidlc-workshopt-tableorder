package com.tableorder.controller;

import com.tableorder.dto.request.TableLoginRequest;
import com.tableorder.dto.request.TableSetupRequest;
import com.tableorder.dto.response.OrderHistoryResponse;
import com.tableorder.dto.response.TableLoginResponse;
import com.tableorder.dto.response.TableSetupResponse;
import com.tableorder.security.AdminClaims;
import com.tableorder.service.AuthService;
import com.tableorder.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Table", description = "테이블 관리 API")
public class TableController {

    private final AuthService authService;
    private final TableService tableService;

    @PostMapping("/api/tables/login")
    @Operation(summary = "테이블 로그인")
    public ResponseEntity<TableLoginResponse> tableLogin(@Valid @RequestBody TableLoginRequest request) {
        return ResponseEntity.ok(authService.tableLogin(
                request.storeIdentifier(), request.tableNumber(), request.password()));
    }

    @PostMapping("/api/admin/tables/setup")
    @Operation(summary = "테이블 초기 설정")
    public ResponseEntity<TableSetupResponse> setupTable(
            @AuthenticationPrincipal AdminClaims claims,
            @Valid @RequestBody TableSetupRequest request) {
        return ResponseEntity.ok(tableService.setupTable(
                claims.storeId(), request.tableNumber(), request.password()));
    }

    @PostMapping("/api/admin/tables/{tableId}/complete")
    @Operation(summary = "테이블 이용 완료")
    public ResponseEntity<Void> completeTableSession(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long tableId) {
        tableService.completeTableSession(tableId, claims.storeId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/admin/tables/{tableId}/history")
    @Operation(summary = "테이블 과거 주문 내역")
    public ResponseEntity<List<OrderHistoryResponse>> getTableHistory(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long tableId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(tableService.getTableHistory(tableId, claims.storeId(), from, to));
    }
}
