package com.assurance.sante.connect.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String role;
    private String organization;
    private String telephone;
    private String adresse;
}
