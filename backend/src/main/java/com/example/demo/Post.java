package com.example.demo;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue
    private Long id;

    // userId is mapped as read-only; it's set via the user relationship
    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "image_time")
    private LocalDateTime imageTime;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Post(User user, String imagePath, LocalDateTime imageTime) {
        this.user = user;
        this.imagePath = imagePath;
        this.imageTime = imageTime;
    }

    // Default constructor for JPA
    public Post() {}

    public Long getId() {
        return this.id;
    }

    public Long getUserId() {
        // userId is mapped as a column, but you can also get it from the user entity
        return user != null ? user.getId() : null;
    }

    public String getImagePath() {
        return this.imagePath;
    }

    public LocalDateTime getImageTime() {
        return this.imageTime;
    }

    public User getUser() {
        return this.user;
    }

    public void setId(Long newId) {
        this.id = newId;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setImagePath(String newImagePath) {
        this.imagePath = newImagePath;
    }

    public void setImageTime(LocalDateTime newImageTime) {
        this.imageTime = newImageTime;
    }

    @Override
    public String toString() {
        return "Post{" +
            "id=" + id +
            ", userId=" + getUserId() +
            ", imagePath='" + imagePath + '\'' +
            ", imageTime=" + imageTime +
            '}';
    }
}
