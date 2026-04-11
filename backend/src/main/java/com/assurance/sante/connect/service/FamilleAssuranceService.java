package com.assurance.sante.connect.service;

import com.assurance.sante.connect.entity.FamilleAssurance;
import com.assurance.sante.connect.exception.ResourceNotFoundException;
import com.assurance.sante.connect.repository.FamilleAssuranceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FamilleAssuranceService {

    private final FamilleAssuranceRepository repository;

    public List<FamilleAssurance> getAll() {
        return repository.findAll();
    }

    public FamilleAssurance getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Famille non trouvée : " + id));
    }

    public FamilleAssurance create(Map<String, Object> data) {
        FamilleAssurance f = buildFromMap(new FamilleAssurance(), data);
        return repository.save(f);
    }

    public FamilleAssurance update(Long id, Map<String, Object> data) {
        FamilleAssurance f = getById(id);
        buildFromMap(f, data);
        return repository.save(f);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }

    @SuppressWarnings("unchecked")
    private FamilleAssurance buildFromMap(FamilleAssurance f, Map<String, Object> data) {
        if (data.containsKey("principal"))     f.setPrincipal((String) data.get("principal"));
        if (data.containsKey("telephone"))     f.setTelephone((String) data.get("telephone"));
        if (data.containsKey("photo"))         f.setPhoto((String) data.get("photo"));
        if (data.containsKey("dateDebut"))     f.setDateDebut((String) data.get("dateDebut"));
        if (data.containsKey("dureeGarantie")) f.setDureeGarantie((String) data.get("dureeGarantie"));
        if (data.containsKey("prime"))         f.setPrime((String) data.get("prime"));
        if (data.containsKey("primeNette"))    f.setPrimeNette((String) data.get("primeNette"));
        if (data.containsKey("taxes"))         f.setTaxes((String) data.get("taxes"));
        if (data.containsKey("echeanceAuto"))  {
            Object v = data.get("echeanceAuto");
            f.setEcheanceAuto(v instanceof Boolean ? (Boolean) v : Boolean.parseBoolean(v.toString()));
        }
        if (data.containsKey("typePrincipal")) {
            String tp = data.get("typePrincipal").toString().toUpperCase().replace("_AGE", "_AGE");
            f.setTypePrincipal(FamilleAssurance.TypeAssure.valueOf(
                tp.equals("ADULTE_AGE") ? "ADULTE_AGE" : "ADULTE"
            ));
        }
        if (data.containsKey("statut")) {
            try { f.setStatut(FamilleAssurance.StatutContrat.valueOf(
                    data.get("statut").toString().toUpperCase())); } catch (Exception ignored) {}
        }
        if (data.containsKey("beneficiaires")) {
            Object b = data.get("beneficiaires");
            if (b instanceof List) f.setBeneficiaires((List<String>) b);
        }
        return f;
    }
}
