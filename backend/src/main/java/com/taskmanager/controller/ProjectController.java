package com.taskmanager.controller;

import com.taskmanager.dto.ProjectDTO;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectDTO.ProjectResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.create(principal.getUser(), request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO.ProjectResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.listUserProjects(principal.getUser()));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDTO.ProjectResponse> getProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.getProject(projectId, principal.getUser()));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectDTO.AddMemberRequest request) {
        projectService.addMember(projectId, principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<ProjectDTO.MemberResponse>> getMembers(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.getMembers(projectId, principal.getUser()));
    }
}
