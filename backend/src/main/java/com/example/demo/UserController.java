//import java.util.Map;
package com.example.demo;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository repository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository repository, 
                            AuthenticationManager authenticationManager, 
                            UserDetailsService userDetailsService, 
                            JwtUtil jwtUtil, 
                            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody User user) {
        try {
            if(user.getPassword().length() < 8 || user.getName().length() < 8){
                throw new IllegalArgumentException("Credentials violation occurred");
            }
            else if(user.getEmail().length() < 5 || !(user.getEmail().contains(".com"))){
                throw new IllegalArgumentException("Email violation occurred");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            System.out.println("About to save...");
            return repository.save(user);
        }
        catch (DataIntegrityViolationException e){
            System.out.println("Error!");
            throw new DataIntegrityViolationException("Data integrity violation occurred");
        }
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getName(), loginRequest.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getName());
            User user = new User();
            user.setName(userDetails.getUsername());
            user.setPassword(userDetails.getPassword());
            String token = jwtUtil.generateToken(user);
            System.out.println("User " + user.getName() + " logged in successfully with token: " + token);
            Cookie cookie = new Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // Set to true in production (requires HTTPS)
            cookie.setPath("/");
            cookie.setMaxAge(24 * 60 * 60);
            response.addCookie(cookie);
            return ResponseEntity.ok(new LoginResponse(user.getName(), token));
        }

        catch(AuthenticationException ex){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @GetMapping("/api/me")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String token = jwtUtil.extractJwtFromCookie(request);
            String username = jwtUtil.extractUsername(token);
            UserDetails user = userDetailsService.loadUserByUsername(username);
            return ResponseEntity.ok(user);
        }

        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input: " + e.getMessage());
        } 
        catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed: " + e.getMessage());
        } 
    }
    
    @PostMapping("/api/logout")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        try {
            Cookie cookie = new Cookie("jwt","");
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
            return ResponseEntity.ok("User logged out successfully!");
        }

        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input: " + e.getMessage());
        } 
        catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed: " + e.getMessage());
        } 
    }
}