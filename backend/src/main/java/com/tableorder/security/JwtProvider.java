package com.tableorder.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey key;
    private final long adminExpiration;
    private final long tableExpiration;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.admin-expiration}") long adminExpiration,
            @Value("${jwt.table-expiration}") long tableExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.adminExpiration = adminExpiration;
        this.tableExpiration = tableExpiration;
    }

    public long getAdminExpiration() {
        return adminExpiration;
    }

    public String generateAdminToken(Long storeId, String username) {
        return Jwts.builder()
                .claim("type", "ADMIN")
                .claim("storeId", storeId)
                .claim("username", username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + adminExpiration))
                .signWith(key)
                .compact();
    }

    public String generateTableToken(Long tableId, Long storeId, Long sessionId) {
        return Jwts.builder()
                .claim("type", "TABLE")
                .claim("tableId", tableId)
                .claim("storeId", storeId)
                .claim("sessionId", sessionId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + tableExpiration))
                .signWith(key)
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload();
        } catch (JwtException e) {
            throw new com.tableorder.exception.UnauthorizedException("유효하지 않은 토큰입니다");
        }
    }

    public String getTokenType(String token) {
        return (String) validateToken(token).get("type");
    }

    public AdminClaims extractAdminClaims(Claims claims) {
        Long storeId = claims.get("storeId", Long.class);
        String username = claims.get("username", String.class);
        return new AdminClaims(storeId, username);
    }

    public TableClaims extractTableClaims(Claims claims) {
        Long tableId = claims.get("tableId", Long.class);
        Long storeId = claims.get("storeId", Long.class);
        Long sessionId = claims.get("sessionId", Long.class);
        return new TableClaims(tableId, storeId, sessionId);
    }
}
