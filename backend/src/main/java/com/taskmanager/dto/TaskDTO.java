package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class TaskDTO {
    public record CreateRequest(
            Long projectId,
            @NotBlank @Size(min = 2, max = 200) String title,
            @Size(max = 1000) String description,
            Long assigneeId,
            Instant dueDate
    ) {}

    public record UpdateRequest(
            String status,
            Long assigneeId,
            Instant dueDate
    ) {}

    public record TaskResponse(
            Long id,
            String title,
            String description,
            Long projectId,
            Long assigneeId,
            String assigneeName,
            String status,
            Instant dueDate,
            Instant createdAt,
            Instant completedAt
    ) {}

    public record DashboardStats(
            long totalTasks,
            long assignedTasks,
            long openTasks,
            long overdueTasks,
            long completedTasks,
            TaskStatus tasksByStatus
    ) {}

    public record TaskStatus(
            long todo,
            long inProgress,
            long done
    ) {}
}
