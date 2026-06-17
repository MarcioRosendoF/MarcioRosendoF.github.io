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
      {type: "image", src: "Images/ImagensProjetos/Backend/purchase_verified_api_cover.png"}
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
      en: "Java Spring Boot API featuring Bean Validation and immutable records",
      "pt-br": "API Java Spring Boot com validação via Bean Validation e records imutáveis"
    },
    stack: ["Java 17", "Spring Boot", "Spring Data JPA", "H2 Database", "Bean Validation", "OpenAPI (Swagger)"],
    links: {
      github: "https://github.com/MarcioRosendoF/task-manager-api"
    },
    media: [
      { type: "image", src: "Images/ImagensProjetos/Backend/task_manager_api_cover.png" }
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
  }
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
