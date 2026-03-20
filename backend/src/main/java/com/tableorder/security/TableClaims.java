package com.tableorder.security;

public record TableClaims(Long tableId, Long storeId, Long sessionId) {}
