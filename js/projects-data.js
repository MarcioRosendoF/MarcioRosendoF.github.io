export const projectsData = [
  {
    title: "Idle Journey",
    subtitle: {
      en: "3D Idle RPG",
      "pt-br": "RPG Idle 3D"
    },
    stack: ["Unity (C#)", "Go", "Docker", "WebSockets", "GCP", "Nginx", "Cloudflare"],
    media: [
      { type: "youtube", src: "HGG7ljuRg3M" },
      {
        type: "image",
        src: "Images/ImagensProjetos/IdleJourney/idlejourney1.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/IdleJourney/idlejourney2.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/IdleJourney/idlejourney3.webp"
      }
    ],
    links: {
      play: "https://idle-journey.com/play"
    },
    codeSnippet: `using System;
using System.Collections.Generic;
using UnityEngine;

public struct ItemData
{
    public Guid ItemId;
    public long Quantity;
}

public class InventoryGridView : MonoBehaviour
{
    [SerializeField] private InventorySlotView slotPrefab;
    [SerializeField] private Transform container;

    private readonly List<InventorySlotView> slots = new();

    public void Init(int slotCount)
    {
        Clear();

        for (int i = 0; i < slotCount; i++)
        {
            var slot = Instantiate(slotPrefab, container);
            slot.Clear();
            slots.Add(slot);
        }
    }

    public void Render(IReadOnlyList<ItemData?> items)
    {
        for (int i = 0; i < slots.Count; i++)
        {
            if (i < items.Count && items[i].HasValue)
            {
                var item = items[i].Value;
                slots[i].Set(item.ItemId, item.Quantity);
            }
            else
            {
                slots[i].Clear();
            }
        }
    }

    private void Clear()
    {
        foreach (var slot in slots)
            Destroy(slot.gameObject);

        slots.Clear();
    }
}`,
    language: "csharp",
    fileName: "InventorySystem.cs"
  },
  {
    title: "Tape Us Out",
    subtitle: {
      en: "3D Multiplayer Co-op",
      "pt-br": "Co-op Multiplayer 3D"
    },
    badges: [
      {
        en: "Gamescom LATAM 2025 • Student Panorama",
        "pt-br": "Gamescom LATAM 2025 • Panorama Estudantil"
      },
      {
        en: "Sampa Games • Public Grant",
        "pt-br": "Sampa Games • Edital Público"
      }
    ],
    stack: ["Unity (C#)", "Photon PUN", "Steam SDK", "Multiplayer"],
    media: [
      { type: "youtube", src: "4MI3IPTM3pI" },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout1.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout2.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout3.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout4.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout5.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout6.webp"
      }
    ],
    codeSnippet: `using UnityEngine;
using Photon.Pun;
using System.Collections.Generic;

public class CoopConfirmationGate : MonoBehaviourPun
{
    private HashSet<int> confirmations = new();

    public void Confirm()
    {
        photonView.RPC(nameof(ConfirmRemote), RpcTarget.All, PhotonNetwork.LocalPlayer.ActorNumber);
    }

    [PunRPC]
    private void ConfirmRemote(int actorNumber)
    {
        confirmations.Add(actorNumber);

        if (confirmations.Count >= PhotonNetwork.CurrentRoom.PlayerCount)
        {
            confirmations.Clear();
            OnAllConfirmed();
        }
    }

    protected virtual void OnAllConfirmed()
    {
        Debug.Log("All players confirmed action.");
    }
}`,
    language: "csharp",
    fileName: "NetworkManager.cs",
    links: {
      steam: "https://store.steampowered.com/app/3661830/Tape_Us_Out/"
    }
  },
  {
    title: "Echoes Of Suffering",
    subtitle: {
      en: "3D Horror Escape Room",
      "pt-br": "Escape Room Terror 3D"
    },
    stack: ["Unity (C#)", "3D Horror", "AI", "Optimization"],
    media: [
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/main.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/5MlnVO.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/IdUWSw.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/n2D_r.webp"
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/Corridor.webp"
      }
    ],
    links: {
      itch: "https://paradoxical-time-game.itch.io/echoes-of-suffering"
    },
    codeSnippet: `using UnityEngine;

public enum EnemySoundResponse
{
    None,
    Investigate,
    Alert
}

public class EnemySoundEvaluation
{
    private readonly float investigateRadius;
    private readonly float alertRadius;

    public EnemySoundEvaluation(float investigateRadius, float alertRadius)
    {
        this.investigateRadius = investigateRadius;
        this.alertRadius = alertRadius;
    }

    public EnemySoundResponse Evaluate(Vector3 enemyPosition, Vector3 soundPosition)
    {
        float distance = Vector3.Distance(enemyPosition, soundPosition);

        if (distance <= alertRadius)
            return EnemySoundResponse.Alert;

        if (distance <= investigateRadius)
            return EnemySoundResponse.Investigate;

        return EnemySoundResponse.None;
    }
}`,
    language: "csharp",
    fileName: "EnemyAI.cs"
  },
  {
    title: "I Bet'a Test",
    subtitle: {
      en: "2D Puzzle Game",
      "pt-br": "Puzzle Game 2D"
    },
    stack: ["Unity (C#)", "Fungus", "2D Puzzle", "Narrative"],
    media: [
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/MainBeta.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/26xib6.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/39VzwH.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/5tdnXS.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/SnOWOH.webp" }
    ],
    links: {
      itch: "https://joaopedropelizer.itch.io/i-beta-test"
    },
    codeSnippet: `using UnityEngine;
using UnityEngine.UI;

public class RoomViewController : MonoBehaviour
{
    [SerializeField] private GameObject[] wallViews;
    [SerializeField] private Image backgroundImage;
    [SerializeField] private Sprite[] wallBackgrounds;

    private int currentWall;

    public void Init(int startWall = 0)
    {
        SetWall(startWall);
    }

    public void NextWall()
    {
        SetWall((currentWall + 1) % wallViews.Length);
    }

    public void PreviousWall()
    {
        SetWall((currentWall - 1 + wallViews.Length) % wallViews.Length);
    }

    private void SetWall(int index)
    {
        currentWall = index;
        ApplyView();
    }

    private void ApplyView()
    {
        for (int i = 0; i < wallViews.Length; i++)
            wallViews[i].SetActive(i == currentWall);

        if (backgroundImage != null && currentWall < wallBackgrounds.Length)
            backgroundImage.sprite = wallBackgrounds[currentWall];
    }
}`,
    language: "csharp",
    fileName: "GameManager.cs"
  },
  {
    title: "Booking Scheduler API",
    isBackend: true,
    engineeringBadges: [
      { icon: "check-circle",   variant: "success", label: "Tests: Testcontainers" },
      { icon: "shield-check",   variant: "info",    label: "Security: Keycloak OAuth2" },
      { icon: "zap",            variant: "default", label: "Cache: Redis" },
      { icon: "message-square", variant: "default", label: "Messaging: RabbitMQ" },
    ],
    subtitle: {
      en: "High-performance booking REST API with OAuth2, Redis cache and event-driven notifications",
      "pt-br": "API REST de agendamentos com OAuth2, cache Redis e notificações orientadas a eventos"
    },
    stack: ["Java 21", "Spring Boot 3.4", "PostgreSQL 15", "Redis 7", "RabbitMQ", "Keycloak 24", "Testcontainers", "Docker", "GitHub Actions"],
    links: {
      github: "https://github.com/MarcioRosendoF/booking-scheduler-api"
    },
    media: [
      { type: "image", src: "Images/ImagensProjetos/Backend/booking_scheduler_api_cover.webp" }
    ],
    simulatedEndpoints: {
      "POST /providers": {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1Ni..."
        },
        requestBody: {
          name: "Studio Ink Barber",
          bio: "Premium barbershop and grooming services"
        },
        responseStatus: "201 Created",
        responseBody: {
          id: "b3f1c2a4-7d5e-4c8b-9a1f-2e6d8c0b4a72",
          name: "Studio Ink Barber",
          bio: "Premium barbershop and grooming services",
          createdAt: "2026-07-20T14:32:11Z"
        }
      },
      "POST /providers/{providerId}/slots": {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1Ni..."
        },
        requestBody: {
          startTime: "2026-08-01T09:00:00Z",
          endTime: "2026-08-01T10:00:00Z"
        },
        responseStatus: "201 Created",
        responseBody: {
          id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
          providerId: "b3f1c2a4-7d5e-4c8b-9a1f-2e6d8c0b4a72",
          startTime: "2026-08-01T09:00:00Z",
          endTime: "2026-08-01T10:00:00Z",
          booked: false
        }
      },
      "GET /providers/{providerId}/slots/available": {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        responseStatus: "200 OK",
        responseBody: {
          content: [
            {
              id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
              startTime: "2026-08-01T09:00:00Z",
              endTime: "2026-08-01T10:00:00Z",
              booked: false
            },
            {
              id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
              startTime: "2026-08-01T10:00:00Z",
              endTime: "2026-08-01T11:00:00Z",
              booked: false
            }
          ],
          page: 0,
          size: 10,
          totalElements: 2,
          totalPages: 1
        }
      },
      "POST /bookings": {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1Ni..."
        },
        requestBody: {
          serviceId: "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
          slotId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
        },
        responseStatus: "201 Created",
        responseBody: {
          id: "f6e5d4c3-b2a1-4c3d-2e1f-0a9b8c7d6e5f",
          serviceId: "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
          slotId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
          status: "PENDING",
          createdAt: "2026-07-20T15:05:44Z"
        }
      },
      "PATCH /bookings/{id}/cancel": {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1Ni..."
        },
        requestBody: {
          reason: "Personal schedule conflict"
        },
        responseStatus: "200 OK",
        responseBody: {
          id: "f6e5d4c3-b2a1-4c3d-2e1f-0a9b8c7d6e5f",
          status: "CANCELLED",
          cancelledAt: "2026-07-21T09:12:30Z",
          cancellationReason: "Personal schedule conflict"
        }
      },
      "GET /notifications": {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1Ni..."
        },
        responseStatus: "200 OK",
        responseBody: [
          {
            id: "0a1b2c3d-4e5f-4a6b-7c8d-9e0f1a2b3c4d",
            type: "BOOKING_CONFIRMED",
            message: "Your booking for 2026-08-01T09:00:00Z was confirmed.",
            sentAt: "2026-07-20T15:05:46Z"
          },
          {
            id: "5e4d3c2b-1a0f-4e5d-6c7b-8a9f0e1d2c3b",
            type: "BOOKING_REMINDER",
            message: "Reminder: your appointment starts in 24 hours.",
            sentAt: "2026-07-31T09:00:00Z"
          }
        ]
      }
    }
  },
  {
    title: "Order Notification Service",
    isBackend: true,
    engineeringBadges: [
      { icon: "message-square", variant: "info", label: "Messaging: RabbitMQ" },
      { icon: "check-circle", variant: "success", label: "Tests: JUnit 5 + Mockito" },
      { icon: "database", variant: "default", label: "PostgreSQL & Flyway" },
      { icon: "box", variant: "default", label: "Docker & Testcontainers" },
    ],
    subtitle: {
      en: "REST API with asynchronous event-driven architecture using RabbitMQ",
      "pt-br": "API REST com arquitetura orientada a eventos assíncronos usando RabbitMQ"
    },
    stack: ["Java 17", "Spring Boot 3", "RabbitMQ", "PostgreSQL", "Flyway", "Testcontainers", "JUnit 5", "Docker"],
    links: {
      github: "https://github.com/MarcioRosendoF/order-notification-service"
    },
    media: [
      { type: "image", src: "Images/ImagensProjetos/Backend/order_notification_cover.webp" }
    ],
    simulatedEndpoints: {
      "POST /api/v1/orders": {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        requestBody: {
          customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          items: [
            { productName: "Wireless Keyboard", quantity: 1, unitPrice: 150.00 },
            { productName: "Gaming Mouse", quantity: 2, unitPrice: 85.50 }
          ]
        },
        responseStatus: "201 Created",
        responseBody: {
          orderId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          status: "PENDING",
          totalAmount: 321.00,
          message: "Order received. Processing asynchronously."
        }
      },
      "AMQP order.created": {
        method: "AMQP",
        headers: {
          "Exchange": "order.exchange",
          "Routing-Key": "order.created.key"
        },
        requestBody: {
          eventId: "evt_728391823",
          timestamp: "2026-07-13T14:45:00Z",
          payload: {
            orderId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            status: "PENDING",
            customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
          }
        },
        responseStatus: "ACKNOWLEDGED",
        responseBody: {
          worker: "NotificationConsumer-1",
          status: "Message Processed Successfully",
          action: "Email notification queued for customer."
        }
      },
      "GET /api/v1/notifications?orderId=9b1deb4d": {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        responseStatus: "200 OK",
        responseBody: [
          {
            notificationId: "notif_550e8400",
            orderId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            type: "ORDER_RECEIVED",
            message: "Your order has been received and is being processed.",
            sentAt: "2026-07-13T14:45:01Z"
          }
        ]
      }
    }
  },
  {
    title: "Purchase Verified Review API",
    isBackend: true,
    engineeringBadges: [
      { icon: "check-circle", variant: "success", label: "Tests: 100% Passed" },
      { icon: "shield-check", variant: "info",    label: "Security: JWT Auth" },
      { icon: "database",     variant: "default", label: "Flyway Migrations" },
      { icon: "box",          variant: "default", label: "Testcontainers" },
    ],
    subtitle: {
      en: "Java Spring Boot API with JWT security and Testcontainers integration",
      "pt-br": "API Java Spring Boot com segurança JWT e integração com Testcontainers"
    },
    stack: ["Java 17", "Spring Boot", "PostgreSQL", "Flyway", "JWT", "Testcontainers", "Docker", "GitHub Actions"],
    links: {
      github: "https://github.com/MarcioRosendoF/purchase-verified-review-api"
    },
    media: [
      {type: "image", src: "Images/ImagensProjetos/Backend/purchase_verified_api_cover.webp"}
    ],
    simulatedEndpoints: {
      "POST /api/v1/auth/register": {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        requestBody: {
          email: "recruiter@company.com",
          name: "Recruiter",
          password: "password123"
        },
        responseStatus: "201 Created",
        responseBody: {
          message: "User registered successfully",
          email: "recruiter@company.com"
        }
      },
      "POST /api/v1/auth/login": {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        requestBody: {
          email: "recruiter@company.com",
          password: "password123"
        },
        responseStatus: "200 OK",
        responseBody: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWNydWl0ZXJAY29tcGFueS5jb20iLCJpYXQiOjE3NDk5Mzg0MDB9...",
          type: "Bearer",
          email: "recruiter@company.com"
        }
      },
      "POST /api/v1/reviews": {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1Ni..."
        },
        requestBody: {
          productId: "550e8400-e29b-41d4-a716-446655440000",
          rating: 5,
          comment: "Verified purchase: the build quality is outstanding."
        },
        responseStatus: "201 Created",
        responseBody: {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          productId: "550e8400-e29b-41d4-a716-446655440000",
          rating: 5,
          comment: "Verified purchase: the build quality is outstanding.",
          userId: "10de08d2-5a21-4f11-9aef-88d447d2b271"
        }
      },
      "GET /api/v1/reviews/product/550e8400-e29b-41d4-a716-446655440000": {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        responseStatus: "200 OK",
        responseBody: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            productId: "550e8400-e29b-41d4-a716-446655440000",
            rating: 5,
            comment: "Verified purchase: the build quality is outstanding.",
            userId: "10de08d2-5a21-4f11-9aef-88d447d2b271"
          }
        ]
      }
    },
    codeSnippet: `package com.purchase.review.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}`,
    language: "java",
    fileName: "JwtAuthenticationFilter.java",
  },
  {
    title: "Task Manager API",
    isBackend: true,
    engineeringBadges: [
      { icon: "check-circle", variant: "success", label: "Tests: JUnit 5" },
      { icon: "database",     variant: "default", label: "H2 In-Memory DB" },
      { icon: "shield-check", variant: "default", label: "Bean Validation" },
      { icon: "book-open",    variant: "info",    label: "Swagger OpenAPI" },
    ],
    subtitle: {
      en: "Java Spring Boot API featuring Bean Validation and immutable records, with a React frontend",
      "pt-br": "API Java Spring Boot com validação via Bean Validation e records imutáveis, com frontend em React"
    },
    stack: ["Java 17", "Spring Boot", "Spring Data JPA", "H2 Database", "Bean Validation", "OpenAPI (Swagger)"],
    links: {
      github: "https://github.com/MarcioRosendoF/task-manager-api",
      frontend: "https://github.com/MarcioRosendoF/task-manager-frontend"
    },
    media: [
      { type: "image", src: "Images/ImagensProjetos/Backend/task_manager_api_cover.webp" },
      { type: "image", src: "Images/ImagensProjetos/Backend/task_manager_frontend.webp" }
    ],
    simulatedEndpoints: {
      "GET /api/v1/tasks": {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        responseStatus: "200 OK",
        responseBody: [
          {
            id: 1,
            title: "Implement API Terminal Playground",
            completed: true
          },
          {
            id: 2,
            title: "Configure Engineering Badges",
            completed: false
          }
        ]
      },
      "POST /api/v1/tasks": {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        requestBody: {
          title: "Deploy to production"
        },
        responseStatus: "201 Created",
        responseBody: {
          id: 3,
          title: "Deploy to production",
          completed: false
        }
      },
      "PUT /api/v1/tasks/2": {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        requestBody: {
          title: "Configure Engineering Badges",
          completed: true
        },
        responseStatus: "200 OK",
        responseBody: {
          id: 2,
          title: "Configure Engineering Badges",
          completed: true
        }
      },
      "DELETE /api/v1/tasks/1": {
        method: "DELETE",
        headers: {},
        responseStatus: "204 No Content",
        responseBody: null
      }
    },
    codeSnippet: `import com.taskmanager.api.dto.TaskRequest;
import com.taskmanager.api.dto.TaskResponse;
import com.taskmanager.api.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
    language: "java",
    fileName: "TaskController.java"
  },
];

export const timelineData = [
  {
    id: 5,
    titleKey: "timeline_job5_title",
    dateKey: "timeline_job5_date",
    descKey: "timeline_job5_desc",
    tags: ["timeline_job5_tag_1", "timeline_job5_tag_2", "timeline_job5_tag_3", "timeline_job5_tag_4"]
  },
  {
    id: 1,
    titleKey: "timeline_job1_title",
    dateKey: "timeline_job1_date",
    descKey: "timeline_job1_desc",
    tags: ["timeline_job1_tag_1", "timeline_job1_tag_2", "timeline_job1_tag_3", "timeline_job1_tag_4"]
  },
  {
    id: 2,
    titleKey: "timeline_job2_title",
    dateKey: "timeline_job2_date",
    descKey: "timeline_job2_desc",
    tags: ["timeline_job2_tag_1", "timeline_job2_tag_2", "timeline_job2_tag_3", "timeline_job2_tag_4"]
  },
  {
    id: 3,
    titleKey: "timeline_job3_title",
    dateKey: "timeline_job3_date",
    descKey: "timeline_job3_desc",
    tags: ["timeline_job3_tag_1", "timeline_job3_tag_2", "timeline_job3_tag_3", "timeline_job3_tag_4"]
  },
  {
    id: 4,
    titleKey: "timeline_job4_title",
    dateKey: "timeline_job4_date",
    descKey: "timeline_job4_desc",
    tags: ["timeline_job4_tag_1", "timeline_job4_tag_2", "timeline_job4_tag_3", "timeline_job4_tag_4"]
  }
];


export const tools = [
  { name: "Java", icon: "coffee" },
  { name: "Spring Boot", icon: "leaf" },
  { name: "Hibernate", icon: "layers" },
  { name: "Maven", icon: "package" },
  { name: "JUnit", icon: "flask-conical" },
  { name: "PostgreSQL", icon: "database" },
  { name: "Docker", icon: "container" },
  { name: "Git", icon: "git-branch" },
];
