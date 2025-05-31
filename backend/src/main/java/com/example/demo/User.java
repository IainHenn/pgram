package com.example.demo;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User{
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String email;
    private String password;
    private String image_path;

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

    public String getImagePath(){
        return this.image_path;
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

    public void setImagePath(String newImagePath) {
        this.image_path = newImagePath;
    }

    @Override
    public String toString(){
        return "User{" + "id=" + this.id + ", name='" + this.name + '\'' + ", password='" + this.password + '\'' + ", email='" + this.email + '\'' + '}';
    }
}
