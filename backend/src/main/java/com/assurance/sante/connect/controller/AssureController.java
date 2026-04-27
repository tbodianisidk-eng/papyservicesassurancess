package com.assurance.sante.connect.controller;

import com.assurance.sante.connect.dto.AssureDto;
import com.assurance.sante.connect.dto.ApiResponse;
import com.assurance.sante.connect.service.AssureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Base64;

@RestController
@RequestMapping("/api/assures")
@RequiredArgsConstructor
public class AssureController {

    private final AssureService assureService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAssures() {
        List<AssureDto> assures = assureService.getAllAssures();
        return ResponseEntity.ok(ApiResponse.success(Map.of("assures", assures)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssureDto>> getAssureById(@PathVariable Long id) {
        AssureDto assure = assureService.getAssureById(id);
        return ResponseEntity.ok(ApiResponse.success(assure));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssureDto>> createAssure(@RequestBody AssureDto assureDto) {
        AssureDto createdAssure = assureService.createAssure(assureDto);
        return ResponseEntity.ok(ApiResponse.success(createdAssure));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssureDto>> updateAssure(@PathVariable Long id, @RequestBody AssureDto assureDto) {
        AssureDto updatedAssure = assureService.updateAssure(id, assureDto);
        return ResponseEntity.ok(ApiResponse.success(updatedAssure));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAssure(@PathVariable Long id) {
        assureService.deleteAssure(id);
        return ResponseEntity.ok(ApiResponse.success("Assure deleted successfully"));
    }

    /** Upload photo (base64 data URL) pour un assuré. */
    @PatchMapping("/{id}/photo")
    public ResponseEntity<ApiResponse<AssureDto>> uploadPhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String photo = body.get("photo");
        if (photo == null || photo.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Champ 'photo' manquant"));
        }
        // Valider que c'est bien un data URL image
        if (!photo.startsWith("data:image/")) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Format invalide : data URL image attendu"));
        }
        // Limiter la taille (max ~2 Mo base64 ≈ 2.7 Mo brut)
        if (photo.length() > 3_000_000) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Image trop volumineuse (max 2 Mo)"));
        }
        AssureDto updated = assureService.updatePhoto(id, photo);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
