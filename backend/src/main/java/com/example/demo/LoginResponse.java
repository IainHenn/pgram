package com.example.demo;


public class LoginResponse{
    private String name;
    private String token;

    public LoginResponse(String name, String token) {
        this.name = name;
        this.token = token;
    }

    public String getName(){
        return this.name;
    }

    public String getToken(){
        return this.token;
    }

    public void setName(String newName){
        this.name = newName;
    }

    public void setToken(String newToken){
        this.token = newToken;
    }

    @Override
    public String toString(){
        return "User{" + "'name='" + this.name + '\'' + ", token='" + this.token + '\'' + '}';
    }
}
