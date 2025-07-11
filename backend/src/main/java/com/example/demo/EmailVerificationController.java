package com.example.demo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.Optional;
import java.util.OptionalLong;

import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class EmailVerificationController {
    
    private final VerificationTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public EmailVerificationController(VerificationTokenRepository verificationTokenRepository,
                                        UserRepository userRepository,
                                        EmailService emailService,
                                        AuthenticationManager authenticationManager, 
                                        UserDetailsService userDetailsService, 
                                        JwtUtil jwtUtil) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }
    
    //Verify user before they can access dashboard, draw, etc
    @GetMapping("/check-verification")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> checkUserVerification(@AuthenticationPrincipal UserDetails userDetails){
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Object principal = authentication.getPrincipal();

            if (userDetails == null) {
                return ResponseEntity.badRequest().body("UserDetails is null.");
            }

            String username = userDetails.getUsername();

            Optional<User> user = userRepository.findByName(username);

            if (!user.isPresent()) {
                return ResponseEntity.badRequest().body("User not found.");
            }

            VerificationToken verificationToken = verificationTokenRepository.findByUserAndType(user.get(), "EMAIL_VERIFICATION");

            if (verificationToken == null) {
                return ResponseEntity.badRequest().body("Verification token not found.");
            }


            if (verificationToken.isVerified() && "EMAIL_VERIFICATION".equals(verificationToken.getType())) {
                return ResponseEntity.ok("User is verified.");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not verified.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/check-verification-login")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> checkVerificationLogin(@RequestBody LoginRequest loginRequest){
        try {
            Optional<User> user = userRepository.findByName(loginRequest.getName());
            if (!user.isPresent()) {
                return ResponseEntity.badRequest().body("User not found.");
            }

            VerificationToken verificationToken = verificationTokenRepository.findByUser(user.get());

            if (verificationToken == null) {
                return ResponseEntity.badRequest().body("Verification token not found.");
            }

            if (verificationToken.isVerified() && "EMAIL_VERIFICATION".equals(verificationToken.getType())) {
                return ResponseEntity.ok("User is verified.");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not verified.");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }


    //Need to integrate this into frontend, limit to 3 resends every day
    //Need give this option after the initial send, create new box that asks for resend
    @PostMapping("/resend-token")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> resendVerificationToken(@RequestBody EmailRequest emailRequest) {
        Optional<User> user = userRepository.findByEmail(emailRequest.getEmail());
        if(user.isPresent()){
            VerificationToken verificationToken = verificationTokenRepository.findByUser(user.get());

            if("EMAIL_VERIFICATION".equals(verificationToken.getType())){
                //If user's token is expired
                if(java.time.LocalDateTime.now().isAfter(verificationToken.getExpirationDate())){
                    verificationToken.setExpirationDate(java.time.LocalDateTime.now());
                    verificationToken.setToken(java.util.UUID.randomUUID().toString());
                }
                
                emailService.sendEmail(emailRequest.getEmail(), "Pictogram: Email Verification", "http://localhost:3000/#/verify?token=" + verificationToken.getToken());
                
                return ResponseEntity.ok("Verification token generated and saved.");
            }

            else{
                return ResponseEntity.badRequest().body("Invalid or expired token.");
            }
        
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }
    }
    
    @PostMapping("/generate-token")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> generateVerificationToken(@RequestParam String email){
        Optional<User> user = userRepository.findByEmail(email);

        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        String token = java.util.UUID.randomUUID().toString();
        LocalDateTime expiryDate = java.time.LocalDateTime.now().plusDays(1);

        VerificationToken verificationToken = new VerificationToken(user.get(), token, expiryDate, false, "EMAIL_VERIFICATION");
        verificationTokenRepository.save(verificationToken);

        emailService.sendEmail(email, "Pictogram: Email Verification", "http://localhost:3000/#/verify?token=" + token);
        return ResponseEntity.ok("Verification token generated and saved.");
    }

    @PostMapping("/verify")
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

        if (Optional.ofNullable(verificationToken).isPresent() && "EMAIL_VERIFICATION".equals(verificationToken.getType())) {
            verificationToken.setVerified(true);
            verificationTokenRepository.save(verificationToken);
            return ResponseEntity.ok("Email verified successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }
    }
}
