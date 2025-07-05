package com.example.demo;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.Query;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    public interface GetUsernameAndImagePath {
        String getUsername();
        String getImagePath();
        String getId();
        String getProfilePicturePath();
    }

    List<Post> findByUser(User user);

    @Query("SELECT u.name as username, p.id as id, p.imagePath as imagePath, u.profilePicturePath as profilePicturePath " +
    "FROM Post p JOIN p.user u " +
    "WHERE p.imagePath IS NOT NULL AND " +
    "p.imageTime = (SELECT MAX(p2.imageTime) FROM Post p2 WHERE p2.user = u AND p2.imagePath IS NOT NULL)" +
    "ORDER BY p.imageTime DESC")
    public Page<GetUsernameAndImagePath> getUserPosts(Pageable pageable);
}