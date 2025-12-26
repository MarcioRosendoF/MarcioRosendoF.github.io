window.projectsData = [
  {
    title: "Idle Journey",
    subtitle: {
      en: "3D Idle RPG",
      "pt-br": "RPG Idle 3D",
    },
    stack: ["Unity", "C#", "Go", "WebSocket", "Docker"],
    media: [
      { type: "youtube", src: "HGG7ljuRg3M" },
      {
        type: "image",
        src: "Images/ImagensProjetos/IdleJourney/idlejourney1.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/IdleJourney/idlejourney2.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/IdleJourney/idlejourney3.webp",
      },
    ],
    // Description and Features are loaded from i18n files (project1_description, etc.)
    links: {
      play: "https://idle-journey.com/play",
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
    fileName: "InventorySystem.cs",
  },
  {
    title: "Tape Us Out",
    subtitle: {
      en: "3D Multiplayer Co-op",
      "pt-br": "Co-op Multiplayer 3D",
    },
    badges: [
      {
        en: "Gamescom LATAM 2025 • Panorama Brasil",
        "pt-br": "Gamescom LATAM 2025 • Panorama Brasil",
      },
      {
        en: "BGS 2025 • Official Selection",
        "pt-br": "BGS 2025 • Seleção Oficial",
      },
      {
        en: "Sampa Games • Public Grant",
        "pt-br": "Sampa Games • Edital Público",
      },
    ],
    stack: ["Unity", "C#", "Photon PUN", "Multiplayer"],
    media: [
      { type: "youtube", src: "4MI3IPTM3pI" },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout1.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout2.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout3.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout4.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout5.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/TapeUsOut/tapeusout6.webp",
      },
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
      steam: "https://store.steampowered.com/app/3661830/Tape_Us_Out/",
    },
  },
  {
    title: "Echoes Of Suffering",
    subtitle: {
      en: "3D Horror Escape Room",
      "pt-br": "Escape Room Terror 3D",
    },
    stack: ["Unity", "C#", "AI", "Optimization"],
    media: [
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/main.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/5MlnVO.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/IdUWSw.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/_n2D_r.webp",
      },
      {
        type: "image",
        src: "Images/ImagensProjetos/EchoesOfSuffering/Corridor.webp",
      },
    ],
    links: {
      itch: "https://paradoxical-time-game.itch.io/echoes-of-suffering",
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
    fileName: "EnemyAI.cs",
  },
  {
    title: "I Bet'a Test",
    subtitle: {
      en: "2D Puzzle Game",
      "pt-br": "Puzzle Game 2D",
    },
    stack: ["Unity", "C#", "Fungus", "2D"],
    media: [
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/MainBeta.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/26xib6.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/39VzwH.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/5tdnXS.webp" },
      { type: "image", src: "Images/ImagensProjetos/IBetaTest/SnOWOH.webp" },
    ],
    links: {
      itch: "https://joaopedropelizer.itch.io/i-beta-test",
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
    fileName: "GameManager.cs",
  },
];
