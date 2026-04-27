package de.moments.service;

import de.moments.dto.*;
import de.moments.entity.Moment;
import de.moments.enums.MomentStatus;
import de.moments.enums.MomentType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;

@ApplicationScoped
public class MomentService {

    public List<MomentResponse> findAll() {
        return Moment.<Moment>listAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public MomentResponse findById(Long id) {
        Moment moment = Moment.findById(id);
        if (moment == null) {
            throw new NotFoundException("Moment mit ID " + id + " nicht gefunden");
        }
        return toResponse(moment);
    }

    @Transactional
    public MomentResponse createTargetDate(CreateTargetDateMomentRequest request) {
        Moment moment = new Moment();
        moment.name = request.name();
        moment.type = MomentType.TARGET_DATE;
        moment.targetDate = request.targetDate();
        moment.imageUrl = trimOrNull(request.imageUrl());
        moment.description = trimOrNull(request.description());
        moment.color = trimOrNull(request.color());
        moment.persist();
        return toResponse(moment);
    }

    @Transactional
    public MomentResponse createSinceDate(CreateSinceDateMomentRequest request) {
        Moment moment = new Moment();
        moment.name = request.name();
        moment.type = MomentType.SINCE_DATE;
        moment.startTime = request.startTime() != null ? request.startTime() : Instant.now();
        moment.imageUrl = trimOrNull(request.imageUrl());
        moment.description = trimOrNull(request.description());
        moment.color = trimOrNull(request.color());
        moment.persist();
        return toResponse(moment);
    }

    @Transactional
    public MomentResponse update(Long id, UpdateMomentRequest request) {
        Moment moment = Moment.findById(id);
        if (moment == null) {
            throw new NotFoundException("Moment mit ID " + id + " nicht gefunden");
        }
        moment.name = request.name();
        if (moment.type == MomentType.TARGET_DATE) {
            if (request.targetDate() == null) {
                throw new BadRequestException("targetDate ist erforderlich für geplante Momente");
            }
            moment.targetDate = request.targetDate();
        } else {
            if (request.startTime() != null) {
                moment.startTime = request.startTime();
            }
        }
        moment.imageUrl = trimOrNull(request.imageUrl());
        moment.description = trimOrNull(request.description());
        moment.color = trimOrNull(request.color());
        return toResponse(moment);
    }

    @Transactional
    public void delete(Long id) {
        Moment moment = Moment.findById(id);
        if (moment == null) {
            throw new NotFoundException("Moment mit ID " + id + " nicht gefunden");
        }
        moment.delete();
    }

    public MomentResponse toResponse(Moment moment) {
        MomentStatus status;
        String displayText;
        String sortKey;

        if (moment.type == MomentType.TARGET_DATE) {
            LocalDate today = LocalDate.now(ZoneId.systemDefault());
            LocalDate target = moment.targetDate;
            long daysUntil = ChronoUnit.DAYS.between(today, target);

            if (daysUntil > 0) {
                status = MomentStatus.UPCOMING;
                displayText = "Noch " + daysUntil + (daysUntil == 1 ? " Tag" : " Tage");
            } else if (daysUntil == 0) {
                status = MomentStatus.TODAY;
                displayText = "Heute ist es soweit!";
            } else {
                status = MomentStatus.PAST;
                long daysPast = Math.abs(daysUntil);
                displayText = "War vor " + daysPast + (daysPast == 1 ? " Tag" : " Tagen");
            }
            sortKey = target.toString();

        } else {
            status = MomentStatus.RUNNING;
            Instant start = moment.startTime;
            Instant now = Instant.now();
            long totalSeconds = ChronoUnit.SECONDS.between(start, now);
            if (totalSeconds < 0) totalSeconds = 0;

            long days = totalSeconds / 86400;
            long hours = (totalSeconds % 86400) / 3600;
            long minutes = (totalSeconds % 3600) / 60;

            if (days > 0) {
                displayText = "Läuft seit " + days + (days == 1 ? " Tag" : " Tagen");
            } else if (hours > 0) {
                displayText = "Läuft seit " + hours + (hours == 1 ? " Stunde" : " Stunden");
            } else if (minutes > 0) {
                displayText = "Läuft seit " + minutes + (minutes == 1 ? " Minute" : " Minuten");
            } else {
                displayText = "Gerade eben gestartet";
            }
            sortKey = start.toString();
        }

        return new MomentResponse(
                moment.id,
                moment.name,
                moment.type,
                moment.targetDate,
                moment.startTime,
                moment.imageUrl,
                moment.description,
                moment.color,
                moment.createdAt,
                moment.updatedAt,
                status,
                displayText,
                sortKey
        );
    }

    private String trimOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
