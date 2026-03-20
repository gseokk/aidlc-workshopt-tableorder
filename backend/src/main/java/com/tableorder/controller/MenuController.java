package com.tableorder.controller;

import com.tableorder.dto.request.MenuCreateRequest;
import com.tableorder.dto.request.MenuOrderRequest;
import com.tableorder.dto.request.MenuUpdateRequest;
import com.tableorder.dto.response.CategoryResponse;
import com.tableorder.dto.response.MenuResponse;
import com.tableorder.security.AdminClaims;
import com.tableorder.security.TableClaims;
import com.tableorder.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Menu", description = "메뉴 관리 API")
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/api/customer/menus")
    @Operation(summary = "메뉴 목록 조회")
    public ResponseEntity<List<MenuResponse>> getMenus(
            @AuthenticationPrincipal TableClaims claims,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(menuService.getMenusByCategory(claims.storeId(), categoryId));
    }

    @GetMapping("/api/customer/menus/categories")
    @Operation(summary = "카테고리 목록 조회")
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @AuthenticationPrincipal TableClaims claims) {
        return ResponseEntity.ok(menuService.getCategories(claims.storeId()));
    }

    @GetMapping("/api/admin/menus/categories")
    @Operation(summary = "관리자 카테고리 목록 조회")
    public ResponseEntity<List<CategoryResponse>> getAdminCategories(
            @AuthenticationPrincipal AdminClaims claims) {
        return ResponseEntity.ok(menuService.getCategories(claims.storeId()));
    }

    @GetMapping("/api/admin/menus")
    @Operation(summary = "관리자 메뉴 목록 조회")
    public ResponseEntity<List<MenuResponse>> getAdminMenus(
            @AuthenticationPrincipal AdminClaims claims) {
        return ResponseEntity.ok(menuService.getMenusByCategory(claims.storeId(), null));
    }

    @PostMapping("/api/admin/menus")
    @Operation(summary = "메뉴 등록")
    public ResponseEntity<MenuResponse> createMenu(
            @AuthenticationPrincipal AdminClaims claims,
            @Valid @RequestBody MenuCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(menuService.createMenu(claims.storeId(), request));
    }

    @PutMapping("/api/admin/menus/{menuId}")
    @Operation(summary = "메뉴 수정")
    public ResponseEntity<MenuResponse> updateMenu(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long menuId,
            @Valid @RequestBody MenuUpdateRequest request) {
        return ResponseEntity.ok(menuService.updateMenu(claims.storeId(), menuId, request));
    }

    @DeleteMapping("/api/admin/menus/{menuId}")
    @Operation(summary = "메뉴 삭제")
    public ResponseEntity<Void> deleteMenu(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long menuId) {
        menuService.deleteMenu(claims.storeId(), menuId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/admin/menus/{menuId}/order")
    @Operation(summary = "메뉴 순서 변경")
    public ResponseEntity<Void> updateMenuOrder(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long menuId,
            @Valid @RequestBody MenuOrderRequest request) {
        menuService.updateMenuOrder(claims.storeId(), menuId, request.displayOrder());
        return ResponseEntity.ok().build();
    }
}
