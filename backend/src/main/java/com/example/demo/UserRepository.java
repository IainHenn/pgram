package com.example.demo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    public interface GetUserInfo {
        String getUsername();
        String getBio();
        String getImagePath();
        String getProfilePicturePath();
    }

    Optional<User> findByName(String name);
    Optional<User> findByEmail(String email);

    @Query("SELECT u.name as username, u.bio as bio, u.profilePicturePath as profilePicturePath," +
           "(SELECT p.imagePath FROM Post p WHERE p.user = u AND p.imagePath IS NOT NULL ORDER BY p.imageTime DESC LIMIT 1) as imagePath " +
           "FROM User u WHERE u = :user")
    Optional<GetUserInfo> GetUserInfo(@Param("user") User user);
}