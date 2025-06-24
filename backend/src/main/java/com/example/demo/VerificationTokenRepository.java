package com.example.demo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;


@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    VerificationToken findByToken(String token);
    VerificationToken findByUser(User user);
    VerificationToken findByUserAndType(User user, String type);

    @Query("SELECT v.user FROM VerificationToken v WHERE v.token = :token")
    Optional<User> findUserByToken(String token);
}