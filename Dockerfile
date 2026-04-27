# Stage 1: Build with Node.js + Maven
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Install Node.js 20
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Cache Maven dependencies (layer only invalidated when pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q -Dquarkus.quinoa.enabled=false || true

# Copy source and build
COPY src/ src/
RUN mvn package -DskipTests

# Stage 2: Lean runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/quarkus-app/lib/          ./quarkus-app/lib/
COPY --from=build /app/target/quarkus-app/*.jar         ./quarkus-app/
COPY --from=build /app/target/quarkus-app/app/          ./quarkus-app/app/
COPY --from=build /app/target/quarkus-app/quarkus/      ./quarkus-app/quarkus/

EXPOSE 8080

ENV JAVA_OPTS="-Djava.awt.headless=true -XX:+UseContainerSupport"

CMD ["sh", "-c", "java $JAVA_OPTS -jar quarkus-app/quarkus-run.jar"]
