# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre

RUN useradd --system --uid 1001 --create-home spring
WORKDIR /app

COPY --from=build /app/target/smart-park-*.jar app.jar
RUN chown -R spring:spring /app

USER spring
EXPOSE 8080

# Render free tier: 512 MB
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-XX:+UseSerialGC", "-XX:+ExitOnOutOfMemoryError", "-jar", "/app/app.jar"]
