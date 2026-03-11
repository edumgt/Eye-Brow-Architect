package com.eyebrowarchitect.user.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 회원가입 요청 시 클라이언트로부터 전달받는 데이터 객체
 */
@Getter
@Setter
public class UserSignupDto {
    private String email;
    private String password;
    private String nickname;
    private String bio;
    private Integer age;
    private String gender;
}
