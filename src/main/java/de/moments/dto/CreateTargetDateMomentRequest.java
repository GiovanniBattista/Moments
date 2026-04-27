package de.moments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateTargetDateMomentRequest(
        @NotBlank String name,
        @NotNull LocalDate targetDate,
        String imageUrl,
        String description,
        String color
) {
}
