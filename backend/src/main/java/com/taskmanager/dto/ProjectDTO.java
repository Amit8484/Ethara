package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class ProjectDTO {
    public record CreateRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @Size(max = 500) String description
    ) {}

    public record AddMemberRequest(
            Long userId,
            String role
    ) {}

    public record ProjectResponse(
            Long id,
            String name,
            String description,
            Long ownerId,
            String ownerName,
            long memberCount,
            long taskCount,
            Instant createdAt
    ) {}

    public record MemberResponse(
            Long id,
            String name,
            String email,
            String role
    ) {}
}
