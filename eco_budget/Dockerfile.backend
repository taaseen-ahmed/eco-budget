# Use a more general Maven image with OpenJDK 17
FROM maven:3-openjdk-17-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .

# Run the Maven build
RUN mvn dependency:go-offline

# Copy the source code
COPY src ./src

# Build the application using Maven
RUN mvn clean package -DskipTests

# Use a smaller base image for the runtime
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built jar file from the build image
COPY --from=build /app/target/eco_budget-0.0.1-SNAPSHOT.jar eco_budget.jar

# Expose the port your Spring Boot application will run on
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "eco_budget.jar"]
