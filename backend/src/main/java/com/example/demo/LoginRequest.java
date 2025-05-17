package com.example.demo;
import jakarta.persistence.Entity;

@Entity
public class LoginRequest{
    private String name;
    private String password;

    public String getName(){
        return this.name;
    }

    public String getPassword(){
        return this.password;
    }

    public void setName(String newName){
        this.name = newName;
    }

    public void setPassword(String newPassword){
        this.password = newPassword;
    }

    @Override
    public String toString(){
        return "User{" + "'name='" + this.name + '\'' + ", password='" + this.password + '\'' + '}';
    }
}
