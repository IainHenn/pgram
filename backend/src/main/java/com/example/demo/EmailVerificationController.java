package com.example.demo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class EmailVerificationController {
    
    private final VerificationTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    public EmailVerificationController(VerificationTokenRepository verificationTokenRepository,
                                        UserRepository userRepository,
                                        EmailService emailService) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    
    //Verify user before they can access dashboard, draw, etc


    //Need to integrate this into frontend, limit to 3 resends every day
    //Need give this option after the initial send, create new box that asks for resend
    @PostMapping("/resend-token")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> resendVerificationToken(@RequestParam String email) {
        Optional<User> user = userRepository.findByEmail(email);
        
        if(user.isPresent()){
            VerificationToken verificationToken = verificationTokenRepository.findByUser(user.get());

            //If user's token is expired
            if(java.time.LocalDateTime.now().isAfter(verificationToken.getExpirationDate())){
                verificationToken.setExpirationDate(java.time.LocalDateTime.now());
                verificationToken.setToken(java.util.UUID.randomUUID().toString());
            }
            
            emailService.sendEmail(email, "Pictogram: Email Verification", "http://localhost:3000/#/verify?token=" + verificationToken.getToken());
            
            return ResponseEntity.ok("Verification token generated and saved.");

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

        VerificationToken verificationToken = new VerificationToken(user.get(), token, expiryDate, false);
        verificationTokenRepository.save(verificationToken);

        emailService.sendEmail(email, "Pictogram: Email Verification", "http://localhost:3000/#/verify?token=" + token);
        return ResponseEntity.ok("Verification token generated and saved.");
    }

    @PostMapping("/verify")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String givenToken) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(givenToken);
        if (Optional.ofNullable(verificationToken).isPresent()) {
            verificationToken.setVerified(true);
            verificationTokenRepository.save(verificationToken);
            return ResponseEntity.ok("Email verified successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }
    }
}
