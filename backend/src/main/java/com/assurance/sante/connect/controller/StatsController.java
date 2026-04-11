package com.assurance.sante.connect.controller;

import com.assurance.sante.connect.dto.ApiResponse;
import com.assurance.sante.connect.entity.*;
import com.assurance.sante.connect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final AssureRepository       assureRepository;
    private final PoliceRepository       policeRepository;
    private final SinistreRepository     sinistreRepository;
    private final PrestataireRepository  prestataireRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository         userRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM yy", java.util.Locale.FRENCH);

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        LocalDateTime now           = LocalDateTime.now();
        LocalDateTime startOfMonth  = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfLast   = startOfMonth.minusMonths(1);
        LocalDateTime sixMonthsAgo  = startOfMonth.minusMonths(5);

        List<Sinistre>     sinistres     = sinistreRepository.findAll();
        List<Consultation> consultations = consultationRepository.findAll();
        List<User>         users         = userRepository.findAll();

        Map<String, Object> result = new HashMap<>();

        // ── 1. Tendances (mois en cours vs précédent) ────────────────────
        long sinThisMonth  = sinistres.stream().filter(s -> s.getCreatedAt() != null && !s.getCreatedAt().isBefore(startOfMonth)).count();
        long sinLastMonth  = sinistres.stream().filter(s -> s.getCreatedAt() != null && !s.getCreatedAt().isBefore(startOfLast) && s.getCreatedAt().isBefore(startOfMonth)).count();
        long conThisMonth  = consultations.stream().filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(startOfMonth)).count();
        long conLastMonth  = consultations.stream().filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(startOfLast) && c.getCreatedAt().isBefore(startOfMonth)).count();
        long assuresTotal  = assureRepository.count();
        long usersActifs   = users.stream().filter(u -> u.getStatus() == User.UserStatus.ACTIVE).count();
        long usersPending  = users.stream().filter(u -> u.getStatus() == User.UserStatus.PENDING).count();

        Map<String, Object> tendances = new HashMap<>();
        tendances.put("sinistresThisMonth", sinThisMonth);
        tendances.put("sinistresLastMonth", sinLastMonth);
        tendances.put("consultationsThisMonth", conThisMonth);
        tendances.put("consultationsLastMonth", conLastMonth);
        tendances.put("variationSinistres", sinLastMonth == 0 ? 0 : Math.round((double)(sinThisMonth - sinLastMonth) / sinLastMonth * 100));
        tendances.put("variationConsultations", conLastMonth == 0 ? 0 : Math.round((double)(conThisMonth - conLastMonth) / conLastMonth * 100));
        result.put("tendances", tendances);

        // ── 2. Sinistres par mois (6 derniers mois) ──────────────────────
        Map<String, long[]> byMonth = new TreeMap<>();
        for (int i = 0; i < 6; i++) {
            LocalDateTime m = sixMonthsAgo.plusMonths(i);
            byMonth.put(m.format(MONTH_FMT), new long[]{0, 0, 0});
        }
        for (Sinistre s : sinistres) {
            if (s.getCreatedAt() == null || s.getCreatedAt().isBefore(sixMonthsAgo)) continue;
            String key = s.getCreatedAt().format(MONTH_FMT);
            if (!byMonth.containsKey(key)) continue;
            byMonth.get(key)[0]++;
            if (s.getStatut() == Sinistre.SinistreStatut.PAYE && s.getMontantAccorde() != null)
                byMonth.get(key)[1] += s.getMontantAccorde().longValue();
            if (s.getStatut() == Sinistre.SinistreStatut.EN_ATTENTE)
                byMonth.get(key)[2]++;
        }
        List<Map<String, Object>> sinistresParMois = byMonth.entrySet().stream().map(e -> {
            Map<String, Object> p = new HashMap<>();
            p.put("mois",          e.getKey());
            p.put("sinistres",     e.getValue()[0]);
            p.put("remboursements",e.getValue()[1]);
            p.put("enAttente",     e.getValue()[2]);
            return p;
        }).collect(Collectors.toList());
        result.put("sinistresParMois", sinistresParMois);

        // ── 3. Répartition des sinistres par statut ───────────────────────
        Map<Sinistre.SinistreStatut, Long> statuts = sinistres.stream()
                .collect(Collectors.groupingBy(Sinistre::getStatut, Collectors.counting()));
        List<Map<String, Object>> sinistresByStatut = Arrays.stream(Sinistre.SinistreStatut.values()).map(s -> {
            String label = switch (s) {
                case EN_ATTENTE -> "En attente";
                case EN_COURS   -> "En cours";
                case APPROUVE   -> "Approuvé";
                case REJETE     -> "Rejeté";
                case PAYE       -> "Payé";
            };
            Map<String, Object> m = new HashMap<>();
            m.put("name",  label);
            m.put("value", statuts.getOrDefault(s, 0L));
            return m;
        }).filter(m -> (long) m.get("value") > 0).collect(Collectors.toList());
        result.put("sinistresByStatut", sinistresByStatut);

        // ── 4. Données financières ────────────────────────────────────────
        BigDecimal totalReclame = sinistres.stream()
                .map(s -> s.getMontantReclamation() != null ? s.getMontantReclamation() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAccorde = sinistres.stream()
                .filter(s -> s.getMontantAccorde() != null)
                .map(Sinistre::getMontantAccorde)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaye = sinistres.stream()
                .filter(s -> s.getStatut() == Sinistre.SinistreStatut.PAYE && s.getMontantAccorde() != null)
                .map(Sinistre::getMontantAccorde)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalSinistres = sinistres.size();
        long totalApprouves = sinistres.stream().filter(s ->
                s.getStatut() == Sinistre.SinistreStatut.APPROUVE ||
                s.getStatut() == Sinistre.SinistreStatut.PAYE).count();
        int tauxApprobation = totalSinistres == 0 ? 0 : (int) Math.round((double) totalApprouves / totalSinistres * 100);

        Map<String, Object> financier = new HashMap<>();
        financier.put("totalReclame",     totalReclame);
        financier.put("totalAccorde",     totalAccorde);
        financier.put("totalPaye",        totalPaye);
        financier.put("tauxApprobation",  tauxApprobation);
        result.put("financier", financier);

        // ── 5. Top prestataires par consultations ────────────────────────
        Map<String, Long> prestByName = consultations.stream()
                .filter(c -> c.getPrestataire() != null)
                .collect(Collectors.groupingBy(c -> c.getPrestataire().getNom(), Collectors.counting()));
        List<Map<String, Object>> topPrestataires = prestByName.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("nom",           e.getKey());
                    m.put("consultations", e.getValue());
                    return m;
                }).collect(Collectors.toList());
        result.put("topPrestataires", topPrestataires);

        // ── 6. Statistiques utilisateurs ─────────────────────────────────
        Map<String, Object> userStats = new HashMap<>();
        userStats.put("total",        users.size());
        userStats.put("actifs",       usersActifs);
        userStats.put("pending",      usersPending);
        userStats.put("prestataires", users.stream().filter(u -> u.getRole() == User.UserRole.PRESTATAIRE).count());
        userStats.put("clients",      users.stream().filter(u -> u.getRole() == User.UserRole.CLIENT).count());
        userStats.put("admins",       users.stream().filter(u -> u.getRole() == User.UserRole.ADMIN).count());
        result.put("userStats", userStats);

        // ── 7. Résumé global ──────────────────────────────────────────────
        result.put("totalAssures",      assuresTotal);
        result.put("totalPolices",      policeRepository.count());
        result.put("totalSinistres",    totalSinistres);
        result.put("totalPrestataires", prestataireRepository.count());
        result.put("totalConsultations",consultations.size());
        result.put("totalPrescriptions",prescriptionRepository.count());

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
