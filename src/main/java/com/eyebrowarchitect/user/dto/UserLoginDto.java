package com.eyebrowarchitect.user.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 로그인 요청 시 사용되는 DTO
 */
@Getter
@Setter
public class UserLoginDto {
    private String email;
    private String password;
}
