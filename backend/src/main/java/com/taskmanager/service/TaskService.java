package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.exception.AppException;
import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskDTO.TaskResponse create(User currentUser, TaskDTO.CreateRequest request) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Project not found"));

        checkProjectAccess(project, currentUser);

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Assignee not found"));
        }

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .project(project)
                .assignee(assignee)
                .dueDate(request.dueDate())
                .build();

        taskRepository.save(task);
        return toResponse(task);
    }

    public List<TaskDTO.TaskResponse> getUserTasks(User currentUser) {
        return taskRepository.findByAssigneeId(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskDTO.TaskResponse> getProjectTasks(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Project not found"));

        checkProjectAccess(project, currentUser);

        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TaskDTO.TaskResponse updateTask(Long taskId, User currentUser, TaskDTO.UpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Task not found"));

        checkProjectAccess(task.getProject(), currentUser);

        if (request.status() != null) {
            try {
                TaskStatus status = TaskStatus.valueOf(request.status().toUpperCase());
                task.setStatus(status);
                if (status == TaskStatus.DONE) {
                    task.setCompletedAt(Instant.now());
                }
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status");
            }
        }

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Assignee not found"));
            task.setAssignee(assignee);
        }

        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }

        taskRepository.save(task);
        return toResponse(task);
    }

    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Task not found"));

        checkProjectAccess(task.getProject(), currentUser);
        taskRepository.delete(task);
    }

    public TaskDTO.DashboardStats getDashboardStats(User currentUser) {
        List<Task> userTasks = taskRepository.findByAssigneeId(currentUser.getId());

        long total = userTasks.size();
        long open = userTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE).count();
        long overdue = taskRepository.findByStatusAndDueDateBefore(TaskStatus.DONE, Instant.now()).stream()
                .filter(t -> t.getAssignee().getId().equals(currentUser.getId())).count();
        long completed = userTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();

        long todo = userTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = userTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done = completed;

        return new TaskDTO.DashboardStats(
                total,
                total,
                open,
                overdue,
                completed,
                new TaskDTO.TaskStatus(todo, inProgress, done)
        );
    }

    private void checkProjectAccess(Project project, User currentUser) {
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isMember) {
            throw new AppException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private TaskDTO.TaskResponse toResponse(Task task) {
        return new TaskDTO.TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getProject().getId(),
                task.getAssignee() != null ? task.getAssignee().getId() : null,
                task.getAssignee() != null ? task.getAssignee().getName() : null,
                task.getStatus().name(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getCompletedAt()
        );
    }
}
