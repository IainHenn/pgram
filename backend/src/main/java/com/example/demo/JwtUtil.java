package com.example.demo;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    private final String jwtSecret = "2551e6e753732d07bcc54c9241df1eb542027fd1b9975b4c51aa6403eeb3df03";
    private final long jwtExpirationMs = 86400000;

    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getName())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }
}