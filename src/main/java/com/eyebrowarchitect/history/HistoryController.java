package com.eyebrowarchitect.history;

import com.eyebrowarchitect.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {
    private final HistoryService historyService;
    private final UserService userService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AnalysisHistory>> getHistory(@PathVariable Integer userId) {
        return ResponseEntity.ok(historyService.getHistoryList(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<AnalysisHistory> saveHistory(@PathVariable Integer userId,
            @RequestBody AnalysisHistory history) {
        return ResponseEntity.ok(historyService.saveHistory(userId, history));
    }

    @DeleteMapping("/{historyId}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Integer historyId) {
        historyService.deleteHistory(historyId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{historyId}/main")
    public ResponseEntity<Void> setMain(@RequestParam Integer userId, @PathVariable Integer historyId) {
        historyService.setMainHistory(userId, historyId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/user/{userId}/upload")
    public ResponseEntity<AnalysisHistory> uploadHistory(
            @PathVariable Integer userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(historyService.uploadHistory(userId, file));
    }
}
