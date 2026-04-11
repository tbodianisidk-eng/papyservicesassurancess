package com.assurance.sante.connect.controller;

import com.assurance.sante.connect.dto.ApiResponse;
import com.assurance.sante.connect.entity.Sinistre;
import com.assurance.sante.connect.entity.User;
import com.assurance.sante.connect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SinistreRepository    sinistreRepository;
    private final UserRepository        userRepository;
    private final ConsultationRepository consultationRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        // ── 1. Sinistres EN_ATTENTE ──────────────────────────────────────
        List<Sinistre> enAttente = sinistreRepository.findAll().stream()
                .filter(s -> s.getStatut() == Sinistre.SinistreStatut.EN_ATTENTE)
                .sorted(Comparator.comparing(Sinistre::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        if (!enAttente.isEmpty()) {
            // 1 notification groupée si plus de 3, sinon une par sinistre
            if (enAttente.size() > 3) {
                Map<String, Object> n = new HashMap<>();
                n.put("id",       "sinistres-batch");
                n.put("type",     "sinistre");
                n.put("priority", "high");
                n.put("message",  enAttente.size() + " sinistre(s) en attente d'approbation");
                n.put("detail",   "Action requise");
                n.put("link",     "/sinistres");
                n.put("time",     LocalDateTime.now().format(FMT));
                notifications.add(n);
            } else {
                for (Sinistre s : enAttente) {
                    Map<String, Object> n = new HashMap<>();
                    n.put("id",       "sin-" + s.getId());
                    n.put("type",     "sinistre");
                    n.put("priority", "high");
                    String assureName = s.getAssure() != null
                            ? s.getAssure().getNom() + " " + s.getAssure().getPrenom()
                            : "Inconnu";
                    n.put("message",  "Sinistre " + s.getNumero() + " en attente");
                    n.put("detail",   assureName);
                    n.put("link",     "/sinistres");
                    n.put("time",     s.getCreatedAt() != null ? s.getCreatedAt().format(FMT) : "");
                    notifications.add(n);
                }
            }
        }

        // ── 2. Comptes utilisateurs PENDING ─────────────────────────────
        List<User> pendingUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == User.UserStatus.PENDING)
                .collect(Collectors.toList());

        if (!pendingUsers.isEmpty()) {
            Map<String, Object> n = new HashMap<>();
            n.put("id",       "users-pending");
            n.put("type",     "user");
            n.put("priority", "high");
            n.put("message",  pendingUsers.size() + " compte(s) en attente d'activation");
            n.put("detail",   "Cliquez pour gérer les utilisateurs");
            n.put("link",     "/users");
            n.put("time",     LocalDateTime.now().format(FMT));
            notifications.add(n);
        }

        // ── 3. Sinistres récents (7 derniers jours, hors EN_ATTENTE) ────
        List<Sinistre> recent = sinistreRepository.findAll().stream()
                .filter(s -> s.getCreatedAt() != null
                        && s.getCreatedAt().isAfter(sevenDaysAgo)
                        && s.getStatut() != Sinistre.SinistreStatut.EN_ATTENTE)
                .sorted(Comparator.comparing(Sinistre::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        for (Sinistre s : recent) {
            Map<String, Object> n = new HashMap<>();
            n.put("id",       "recent-sin-" + s.getId());
            n.put("type",     "sinistre_recent");
            n.put("priority", "low");
            String statusLabel = switch (s.getStatut()) {
                case APPROUVE -> "approuvé";
                case PAYE     -> "payé";
                case REJETE   -> "rejeté";
                case EN_COURS -> "en cours";
                default       -> s.getStatut().name().toLowerCase();
            };
            String assureName = s.getAssure() != null
                    ? s.getAssure().getNom() + " " + s.getAssure().getPrenom()
                    : "Inconnu";
            n.put("message", "Sinistre " + s.getNumero() + " " + statusLabel);
            n.put("detail",  assureName);
            n.put("link",    "/sinistres");
            n.put("time",    s.getCreatedAt().format(FMT));
            notifications.add(n);
        }

        // ── 4. Consultations récentes (7 derniers jours) ────────────────
        long recentConsultations = consultationRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(sevenDaysAgo))
                .count();

        if (recentConsultations > 0) {
            Map<String, Object> n = new HashMap<>();
            n.put("id",       "consult-recent");
            n.put("type",     "consultation");
            n.put("priority", "low");
            n.put("message",  recentConsultations + " consultation(s) cette semaine");
            n.put("detail",   "");
            n.put("link",     "/consultations");
            n.put("time",     LocalDateTime.now().format(FMT));
            notifications.add(n);
        }

        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
}
