package de.moments.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.time.LocalDate;

public record UpdateMomentRequest(
        @NotBlank String name,
        LocalDate targetDate,
        Instant startTime,
        String imageUrl,
        String description,
        String color
) {
}
