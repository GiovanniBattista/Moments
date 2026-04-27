package de.moments.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record CreateSinceDateMomentRequest(
        @NotBlank String name,
        Instant startTime,
        String imageUrl,
        String description,
        String color
) {
}
