package com.assurance.sante.connect.repository;

import com.assurance.sante.connect.entity.FamilleAssurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FamilleAssuranceRepository extends JpaRepository<FamilleAssurance, Long> {
}
