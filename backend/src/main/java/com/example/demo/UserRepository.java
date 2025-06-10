package com.example.demo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    public interface GetUsernameAndImagePath {
        String getUsername();
        String getImagePath();
    }

    Optional<User> findByName(String name);

    @Query("SELECT u.name as username, u.imagePath as imagePath FROM User u WHERE u.imagePath IS NOT NULL")
    public List<GetUsernameAndImagePath> getUserPosts();
}