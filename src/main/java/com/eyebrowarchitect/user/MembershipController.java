package com.eyebrowarchitect.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/membership")
@RequiredArgsConstructor
public class MembershipController {
    private final MembershipService membershipService;

    @PostMapping("/upgrade/{userId}")
    public User upgrade(@PathVariable Integer userId) {
        return membershipService.upgradeMembership(userId);
    }

    @PostMapping("/cancel/{userId}")
    public User cancel(@PathVariable Integer userId) {
        return membershipService.cancelMembership(userId);
    }
}
