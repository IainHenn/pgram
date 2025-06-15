package com.example.demo;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
//import org.springframework.data.jpa.repository.Query;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    public interface GetUsernameAndImagePath {
        String getUsername();
        String getImagePath();
    }

    @Query("SELECT u.name as username, p.imagePath as imagePath FROM Post p JOIN p.user u WHERE p.imagePath IS NOT NULL ORDER BY p.imageTime")
    public List<GetUsernameAndImagePath> getUserPosts();
}