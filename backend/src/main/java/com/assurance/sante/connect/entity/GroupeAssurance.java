package com.assurance.sante.connect.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "groupes_assurance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeAssurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String entreprise;

    private String secteur;

    @Column(name = "nb_employes")
    private Integer employes;

    @Column(name = "nb_assures")
    private Integer assures;

    @Column(name = "date_debut")
    private String debut;

    @Column(name = "duree_garantie")
    private String dureeGarantie = "1";

    @Column(name = "echeance_auto")
    private Boolean echeanceAuto = true;

    private String prime;

    @Column(name = "prime_nette")
    private String primeNette;

    private String taxes;

    // JSON sérialisé : liste des employés avec leur famille et photo
    @Column(name = "employes_detail", columnDefinition = "TEXT")
    private String employesDetail;

    @Enumerated(EnumType.STRING)
    private StatutContrat statut = StatutContrat.ACTIF;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum StatutContrat { ACTIF, SUSPENDU, RESILIE }
}
