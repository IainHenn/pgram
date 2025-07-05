package com.example.demo;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.PostRepository.GetUsernameAndImagePath;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Value;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    
    @Value("${aws.bucket.name}")
    private String bucketName;

    @Autowired
    private final S3Client s3client = S3Client.create();

    public UserController(UserRepository userRepository,
                            PostRepository postRepository, 
                            AuthenticationManager authenticationManager, 
                            UserDetailsService userDetailsService, 
                            JwtUtil jwtUtil, 
                            PasswordEncoder passwordEncoder,
                            VerificationTokenRepository verificationTokenRepository,
                            EmailService emailService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
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
            user.setProfilePicturePath("https://" + bucketName + ".s3.amazonaws.com/profile_pictures/" + "default_photo_pgram.png");
            user.setProfilePictureTime(LocalDateTime.now());
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

    @GetMapping("/users/{username}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> fetchProfile(@PathVariable String username){
        Optional<User> user = userRepository.findByName(username);
        if(user.isPresent()){
            System.out.println(user.toString());
            return ResponseEntity.ok(userRepository.GetUserInfo(user.get()));
        } else { 
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @PostMapping("/users/self/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@AuthenticationPrincipal UserDetails userDetails, @RequestParam("profilePicture") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }
        String username = userDetails.getUsername();
        Optional<User> user = userRepository.findByName(username);
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || 
                !(contentType.equalsIgnoreCase("image/png") || 
                  contentType.equalsIgnoreCase("image/jpeg") || 
                  contentType.equalsIgnoreCase("image/jpg"))) {
                return ResponseEntity.badRequest().body("Invalid file type. Only PNG, JPG, and JPEG are allowed.");
            }

            String extension = contentType.equalsIgnoreCase("image/png") ? ".png" : ".jpg";
            String key = "profile_pictures/" + username + "_" + System.currentTimeMillis() + extension;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();

            s3client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));

            // Update user's profile picture path and time
            if (user.isPresent()) {
                User u = user.get();
                
                String defaultProfilePic = "https://" + bucketName + ".s3.amazonaws.com/profile_pictures/" + "default_photo_pgram.png";

                if(u.getProfilePicturePath() != null && u.getProfilePicturePath().isEmpty() && !u.getProfilePicturePath().equals(defaultProfilePic)){
                    String profilePicturePath = u.getProfilePicturePath();
                    String deleteKey = profilePicturePath.replace("https://" + bucketName + ".s3.amazonaws.com/", "");
                    software.amazon.awssdk.services.s3.model.DeleteObjectRequest deleteObjectRequest =
                        software.amazon.awssdk.services.s3.model.DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(deleteKey)
                            .build();
                    s3client.deleteObject(deleteObjectRequest);
                }
                u.setProfilePicturePath("https://" + bucketName + ".s3.amazonaws.com/" + key);
                u.setProfilePictureTime(LocalDateTime.now());
                userRepository.save(u);
            }
            else{
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload profile picture");
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload profile picture");
        }

        // Returning the new path
        if (user.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("profilePicturePath", user.get().getProfilePicturePath());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload profile picture");
        }
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

    @DeleteMapping("/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<?> deletePost(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        String postPath = post.getImagePath();
        String key = postPath.replace("https://" + bucketName + ".s3.amazonaws.com/", "");
        software.amazon.awssdk.services.s3.model.DeleteObjectRequest deleteObjectRequest =
            software.amazon.awssdk.services.s3.model.DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        s3client.deleteObject(deleteObjectRequest);
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            // Check if user exists
            Optional<User> userOpt = userRepository.findByName(loginRequest.getName());
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found.");
            }

            User user = userOpt.get();

            // Check verification status
            VerificationToken verificationToken = verificationTokenRepository.findByUserAndType(userOpt.get(), "EMAIL_VERIFICATION");
            if (verificationToken == null) {
                return ResponseEntity.badRequest().body("Verification token not found.");
            }
            if (!verificationToken.isVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not verified.");
            }

            // Authenticate user
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getName(), loginRequest.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getName());
            user.setName(userDetails.getUsername());
            user.setPassword(userDetails.getPassword());
            String token = jwtUtil.generateToken(userOpt.get());
            Cookie cookie = new Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // Set to true in production (requires HTTPS)
            cookie.setPath("/");
            cookie.setMaxAge(24 * 60 * 60);
            response.addCookie(cookie);
            return ResponseEntity.ok(new LoginResponse(user.getName(), token));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
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
        String key = "images/" + username + "_" + System.currentTimeMillis() + "_drawing.png";

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image");
        }
        return new ResponseEntity<Map<String, String>>(response, HttpStatus.OK);
    }

    @GetMapping("/posts")
    @ResponseStatus(HttpStatus.OK)
    public Page<GetUsernameAndImagePath> getPosts(Pageable pageable){
        return postRepository.getUserPosts(pageable);
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

    @PostMapping("/users/generate-password-token")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> generateVerificationToken(@RequestParam String email){
        Optional<User> user = userRepository.findByEmail(email);

        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        String token = java.util.UUID.randomUUID().toString();
        LocalDateTime expiryDate = java.time.LocalDateTime.now().plusDays(1);

        VerificationToken verificationToken = new VerificationToken(user.get(), token, expiryDate, false, "PASSWORD_RESET");
        verificationTokenRepository.save(verificationToken);

        emailService.sendEmail(email, "Pictogram: Password Reset", "http://localhost:3000/#/password-reset?token=" + token);
        return ResponseEntity.ok("Verification token generated and saved.");
    }

    @PostMapping("/users/verify-token")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String givenToken) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(givenToken);

        if (verificationToken == null) {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }

        if (java.time.LocalDateTime.now().isAfter(verificationToken.getExpirationDate())) {
            return ResponseEntity.badRequest().body("Token has expired.");
        }

        if (verificationToken.isVerified()) {
            return ResponseEntity.badRequest().body("Token has already been used.");
        }

        if (Optional.ofNullable(verificationToken).isPresent() && "PASSWORD_RESET".equals(verificationToken.getType())) {
            verificationToken.setVerified(true);
            verificationTokenRepository.save(verificationToken);
            return ResponseEntity.ok("Token is valid.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }
    }

    @PostMapping("/users/reset-password")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> resetPassword(@RequestParam("token") String givenToken, @RequestBody PasswordResetRequest passwordResetRequest){
        Optional<User> user = verificationTokenRepository.findUserByToken(givenToken);

        if(user != null && user.isPresent()){
            if(passwordEncoder.matches(passwordResetRequest.getOldPassword(), user.get().getPassword())){
                user.get().setPassword(passwordEncoder.encode(passwordResetRequest.getNewPassword()));
                userRepository.save(user.get());
                return ResponseEntity.ok("Password reset successful.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old password is incorrect.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token.");
        }
    }
}