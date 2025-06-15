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
    }

    Optional<User> findByName(String name);

    @Query("SELECT u.name as username, u.bio as bio, p.imagePath as imagePath " +
       "FROM Post p JOIN p.user u " +
       "WHERE p.imagePath IS NOT NULL AND " +
       "u = :user AND " +
       "p.imageTime = (SELECT MAX(p2.imageTime) FROM Post p2 WHERE p2.user = u AND p2.imagePath IS NOT NULL)")
    Optional<GetUserInfo> GetUserInfo(@Param("user") User user);
}