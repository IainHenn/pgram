package com.example.demo;
import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties.AssertingParty.Verification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
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
import java.util.Optional;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class EmailVerificationController {
    
    private final VerificationTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;
    
    public EmailVerificationController(VerificationTokenRepository verificationTokenRepository,
                                        UserRepository userRepository) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.userRepository = userRepository;
    }

    //Need to create a resend route
    

    //Need to send a authentication email with the verify route
    @PostMapping("/verification-tokens")
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
