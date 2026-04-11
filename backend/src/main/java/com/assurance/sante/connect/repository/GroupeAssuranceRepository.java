package com.assurance.sante.connect.repository;

import com.assurance.sante.connect.entity.GroupeAssurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupeAssuranceRepository extends JpaRepository<GroupeAssurance, Long> {
}
