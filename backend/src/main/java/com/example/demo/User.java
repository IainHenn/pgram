package com.example.demo;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User{
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String email;
    private String password;
    @Column(name = "pp_path")
    private String profilePicturePath;
    @Column(name = "pp_time")
    private LocalDateTime profilePictureTime;
    private String bio;

    public String getName(){
        return this.name;
    }

    public String getEmail(){
        return this.email;
    }

    public String getPassword(){
        return this.password;
    }

    public Long getId(){
        return this.id;
    }

    public String getProfilePicturePath(){
        return this.profilePicturePath;
    }

    public LocalDateTime getProfilePictureTime() {
        return this.profilePictureTime;
    }

    public String getBio() {
        return this.bio;
    }

    public void setName(String newName){
        this.name = newName;
    }

    public void setEmail(String newEmail){
        this.email = newEmail;
    }

    public void setPassword(String newPassword){
        this.password = newPassword;
    }

    public void setId(Long newId){
        this.id = newId;
    }

    public void setProfilePicturePath(String newProfilePicturePath) {
        this.profilePicturePath = newProfilePicturePath;
    }

    public void setProfilePictureTime(LocalDateTime newProfilePictureTime) {
        this.profilePictureTime = newProfilePictureTime;
    }

    public void setBio(String newBio) {
        this.bio = newBio;
    }
    @Override
    public String toString(){
        return "User{" +
                "id=" + this.id +
                ", name='" + this.name + '\'' +
                ", password='" + this.password + '\'' +
                ", email='" + this.email + '\'' +
                ", profilePicturePath='" + this.profilePicturePath + '\'' +
                '}';
    }
}
