package com.taskmanager.controller;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDTO.TaskResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.create(principal.getUser(), request));
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO.TaskResponse>> getTasks(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(taskService.getUserTasks(principal.getUser()));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDTO.TaskResponse>> getProjectTasks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, principal.getUser()));
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskDTO.TaskResponse> updateTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody TaskDTO.UpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTask(taskId, principal.getUser(), request));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal) {
        taskService.deleteTask(taskId, principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<TaskDTO.DashboardStats> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(taskService.getDashboardStats(principal.getUser()));
    }
}
