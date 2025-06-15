package com.example.demo;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserRepository userRepository;
    private final PostRepository postRepository; // Ensure PostRepository extends CrudRepository<Post, Long> or JpaRepository<Post, Long>
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    private final S3Client s3client = S3Client.create();

    public UserController(UserRepository userRepository,
                            PostRepository postRepository, 
                            AuthenticationManager authenticationManager, 
                            UserDetailsService userDetailsService, 
                            JwtUtil jwtUtil, 
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
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
            return userRepository.save(user);
        }
        catch (DataIntegrityViolationException e){
            throw new DataIntegrityViolationException("Data integrity violation occurred");
        }
    }
    
    @GetMapping("/users/self")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> fetchProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userRepository.findByName(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(userRepository.GetUserInfo(user));
    }

    @PatchMapping("/users/self")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails, 
    @RequestBody User user, HttpServletResponse response){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        String username = userDetails.getUsername();
        User originalUser = userRepository.findByName(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        String bio = originalUser.getBio();
        String newUsername = user.getName();
        String newBio = user.getBio();

        if(userRepository.findByName(newUsername).isPresent() && !username.equals(newUsername)){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        else {
            if(newUsername != null){
                originalUser.setName(newUsername);
                String token = jwtUtil.generateToken(originalUser);
                Cookie cookie = new Cookie("jwt", token);
                cookie.setHttpOnly(true);
                cookie.setSecure(true); // Set to true in production (requires HTTPS)
                cookie.setPath("/");
                cookie.setMaxAge(24 * 60 * 60);
                response.addCookie(cookie);
            }
            
            if(newBio != null){
                originalUser.setBio(newBio);
            }

            userRepository.save(originalUser);

            return ResponseEntity.ok(HttpStatus.OK);
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

    @PostMapping("/multipart/drawing")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> logUserImage(
    @AuthenticationPrincipal UserDetails userDetails, 
    @RequestParam("image") MultipartFile image
    ) {
        Map<String, String> response = new HashMap<>();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        String username = userDetails.getUsername();
        String password = userDetails.getPassword();
        String bucketName = "pgram";
        String key = "images/" + username + "_" + System.currentTimeMillis() + "_drawing.png";
        if(image != null){
            System.out.println("file exists!");
        }

        try {
            //Upload image to Amazon S3 SDK
            PutObjectRequest request = PutObjectRequest.builder()
                                    .bucket(bucketName)
                                    .key(key)
                                    .contentType(image.getContentType())
                                    .build();
            
            s3client.putObject(request, software.amazon.awssdk.core.sync.RequestBody.fromBytes(image.getBytes()));
            
            //Store S3 URL/Path in DB using username to locate user
            User user = userRepository.findByName(userDetails.getUsername()).orElseThrow(() -> new IllegalArgumentException("User not found"));
            String userPostPath = ("https://" + bucketName + ".s3.amazonaws.com/" + key);
            Post userPost = new Post(user, userPostPath, LocalDateTime.now());
            postRepository.save(userPost);
        } catch (IOException e) {
            System.err.println("Error while reading image bytes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image");
        }


        return new ResponseEntity<Map<String, String>>(response, HttpStatus.OK);
    }

    @GetMapping("/posts")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> getPosts(){
        Map<String,List<PostRepository.GetUsernameAndImagePath>> response = new HashMap<>();
       
        response.put("result",postRepository.getUserPosts());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/me/post/status")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> getPostStatus(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Map<String, Boolean> response = new HashMap<>();

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Object principal = authentication.getPrincipal();
            String username = userDetails.getUsername();

            User user = userRepository.findByName(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
            List<Post> userPosts = postRepository.findByUser(user);

            if(userPosts.size() > 0){
                response.put("posted", true);
            }
            else {
                response.put("posted", false);
            }
            return ResponseEntity.ok(response);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to check post status");
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