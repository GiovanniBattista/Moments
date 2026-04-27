package de.moments.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import de.moments.enums.MomentStatus;
import de.moments.enums.MomentType;

import java.time.Instant;
import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MomentResponse(
        Long id,
        String name,
        MomentType type,
        LocalDate targetDate,
        Instant startTime,
        String imageUrl,
        String description,
        String color,
        Instant createdAt,
        Instant updatedAt,
        MomentStatus status,
        String displayText,
        String sortKey
) {
}
