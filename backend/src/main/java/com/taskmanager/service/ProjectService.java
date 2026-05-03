package com.taskmanager.service;

import com.taskmanager.dto.ProjectDTO;
import com.taskmanager.exception.AppException;
import com.taskmanager.model.Project;
import com.taskmanager.model.ProjectMember;
import com.taskmanager.model.Role;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public ProjectDTO.ProjectResponse create(User currentUser, ProjectDTO.CreateRequest request) {
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .owner(currentUser)
                .build();

        projectRepository.save(project);
        return toResponse(project);
    }

    public List<ProjectDTO.ProjectResponse> listUserProjects(User currentUser) {
        return projectRepository.findByOwnerIdOrMembersUserId(currentUser.getId(), currentUser.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProjectDTO.ProjectResponse getProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Project not found"));

        checkAccess(project, currentUser);
        return toResponse(project);
    }

    public void addMember(Long projectId, User currentUser, ProjectDTO.AddMemberRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only project owner can add members");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, request.userId())) {
            throw new AppException(HttpStatus.CONFLICT, "User already in project");
        }

        Role role = Role.MEMBER;
        try {
            role = Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            // Keep default MEMBER role
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(role)
                .build();

        projectMemberRepository.save(member);
    }

    public List<ProjectDTO.MemberResponse> getMembers(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Project not found"));

        checkAccess(project, currentUser);

        return projectMemberRepository.findByProjectId(projectId)
                .stream()
                .map(member -> new ProjectDTO.MemberResponse(
                        member.getUser().getId(),
                        member.getUser().getName(),
                        member.getUser().getEmail(),
                        member.getRole().name()
                ))
                .collect(Collectors.toList());
    }

    private void checkAccess(Project project, User currentUser) {
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isMember) {
            throw new AppException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private ProjectDTO.ProjectResponse toResponse(Project project) {
        return new ProjectDTO.ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getOwner().getName(),
                project.getMembers().size(),
                project.getTasks().size(),
                project.getCreatedAt()
        );
    }
}
