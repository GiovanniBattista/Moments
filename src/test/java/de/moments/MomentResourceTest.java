package de.moments;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class MomentResourceTest {

    @Test
    void getAllMoments_returnsEmptyList() {
        given()
                .when().get("/api/moments")
                .then()
                .statusCode(200)
                .body("$", instanceOf(java.util.List.class));
    }

    @Test
    void createTargetDateMoment_future_returnsUpcoming() {
        String futureDate = LocalDate.now().plusDays(20).toString();

        given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Urlaub\",\"targetDate\":\"" + futureDate + "\"}")
                .when().post("/api/moments/target-date")
                .then()
                .statusCode(201)
                .body("status", is("UPCOMING"))
                .body("displayText", containsString("Noch"))
                .body("displayText", containsString("Tag"));
    }

    @Test
    void createTargetDateMoment_today_returnsToday() {
        String today = LocalDate.now().toString();

        given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Heute\",\"targetDate\":\"" + today + "\"}")
                .when().post("/api/moments/target-date")
                .then()
                .statusCode(201)
                .body("status", is("TODAY"))
                .body("displayText", is("Heute ist es soweit!"));
    }

    @Test
    void createTargetDateMoment_past_returnsPast() {
        String pastDate = LocalDate.now().minusDays(5).toString();

        given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Vergangen\",\"targetDate\":\"" + pastDate + "\"}")
                .when().post("/api/moments/target-date")
                .then()
                .statusCode(201)
                .body("status", is("PAST"))
                .body("displayText", containsString("War vor"));
    }

    @Test
    void createSinceDateMoment_returnsRunning() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Neue Gewohnheit\"}")
                .when().post("/api/moments/since-date")
                .then()
                .statusCode(201)
                .body("status", is("RUNNING"))
                .body("displayText", anyOf(
                        containsString("Läuft seit"),
                        is("Gerade eben gestartet")
                ));
    }

    @Test
    void createTargetDateMoment_emptyName_returns400() {
        String futureDate = LocalDate.now().plusDays(10).toString();

        given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"\",\"targetDate\":\"" + futureDate + "\"}")
                .when().post("/api/moments/target-date")
                .then()
                .statusCode(400);
    }

    @Test
    void createTargetDateMoment_missingTargetDate_returns400() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Ohne Datum\"}")
                .when().post("/api/moments/target-date")
                .then()
                .statusCode(400);
    }

    @Test
    void deleteMoment_notFound_returns404() {
        given()
                .when().delete("/api/moments/99999")
                .then()
                .statusCode(404);
    }

    @Test
    void getMoment_notFound_returns404() {
        given()
                .when().get("/api/moments/99999")
                .then()
                .statusCode(404);
    }

    @Test
    void createAndDeleteMoment_success() {
        String futureDate = LocalDate.now().plusDays(30).toString();

        Integer id = given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Zum Löschen\",\"targetDate\":\"" + futureDate + "\"}")
                .when().post("/api/moments/target-date")
                .then()
                .statusCode(201)
                .extract().path("id");

        given()
                .when().delete("/api/moments/" + id)
                .then()
                .statusCode(204);

        given()
                .when().get("/api/moments/" + id)
                .then()
                .statusCode(404);
    }

    @Test
    void createAndUpdateMoment_success() {
        String futureDate = LocalDate.now().plusDays(10).toString();
        String newDate = LocalDate.now().plusDays(20).toString();

        Integer id = given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Original\",\"targetDate\":\"" + futureDate + "\"}")
                .when().post("/api/moments/target-date")
                .then()
                .statusCode(201)
                .extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Aktualisiert\",\"targetDate\":\"" + newDate + "\"}")
                .when().put("/api/moments/" + id)
                .then()
                .statusCode(200)
                .body("name", is("Aktualisiert"));
    }
}
