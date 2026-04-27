package de.moments.entity;

import de.moments.enums.MomentType;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "moment")
public class Moment extends PanacheEntity {

    @NotBlank
    @Column(nullable = false)
    public String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public MomentType type;

    public LocalDate targetDate;

    public Instant startTime;

    @Column(length = 500)
    public String imageUrl;

    @Column(length = 1000)
    public String description;

    @Column(length = 50)
    public String color;

    @Column(nullable = false)
    public Instant createdAt;

    @Column(nullable = false)
    public Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
