package com.eyebrowarchitect.post;

import com.eyebrowarchitect.design.MakeupPost;
import com.eyebrowarchitect.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/post/{postId}")
    public List<Comment> getComments(@PathVariable Integer postId) {
        return commentService.getCommentsByPost(postId);
    }

    @PostMapping
    public Comment saveComment(@RequestBody CommentRequest request) {
        Comment comment = new Comment();
        MakeupPost post = new MakeupPost();
        post.setPostId(request.getPostId());
        
        User user = new User();
        user.setUserId(request.getUserId());
        
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(request.getContent());
        
        return commentService.addComment(comment);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
    }
}

class CommentRequest {
    private Integer postId;
    private Integer userId;
    private String content;

    public Integer getPostId() { return postId; }
    public void setPostId(Integer postId) { this.postId = postId; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
