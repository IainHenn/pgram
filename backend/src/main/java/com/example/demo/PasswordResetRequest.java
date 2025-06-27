package com.example.demo;

public class PasswordResetRequest {
    private String oldPassword;
    private String newPassword;

    public PasswordResetRequest() {}

    public PasswordResetRequest(String oldPassword, String newPassword){
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
    }

    public String getOldPassword(){
        return this.oldPassword;
    }

    public void setOldPassword(String oldPassword){
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return this.newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
