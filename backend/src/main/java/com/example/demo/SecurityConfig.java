import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity (not recommended for production)
            .cors(cors -> {}) // Enable CORS with default configuration
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/testing").permitAll() // Allow unauthenticated access to "/"
                .anyRequest().authenticated() // Secure other endpoints
            );
        return http.build();
    }
}