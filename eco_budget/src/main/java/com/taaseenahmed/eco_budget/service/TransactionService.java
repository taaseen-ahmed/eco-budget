package com.taaseenahmed.eco_budget.service;

import com.taaseenahmed.eco_budget.entity.AppUser;
import com.taaseenahmed.eco_budget.dto.response.AppUserDTO;
import com.taaseenahmed.eco_budget.entity.Transaction;
import com.taaseenahmed.eco_budget.dto.response.TransactionDTO;
import com.taaseenahmed.eco_budget.repository.AppUserRepository;
import com.taaseenahmed.eco_budget.entity.Category;
import com.taaseenahmed.eco_budget.dto.response.CategoryDTO;
import com.taaseenahmed.eco_budget.repository.CategoryRepository;
import com.taaseenahmed.eco_budget.exception.ResourceNotFoundException;
import com.taaseenahmed.eco_budget.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AppUserRepository appUserRepository;
    private final CategoryRepository categoryRepository;
    private final ChatGPTService chatGPTService;

    // Create a new transaction for the authenticated user
    public TransactionDTO createTransaction(TransactionDTO transactionDTO, String userEmail) {
        // Fetch the user by email
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch the category for the transaction
        Category category = categoryRepository.findById(transactionDTO.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Create and populate a new Transaction object
        Transaction transaction = new Transaction();
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setType(transactionDTO.getType());
        transaction.setDate(transactionDTO.getDate());
        transaction.setDescription(transactionDTO.getDescription());
        transaction.setCategory(category);
        transaction.setAppUser(user);

        // Determine carbon footprint based on description or category multiplier
        Double carbonMultiplierUsed = null;
        if (transactionDTO.getDescription() != null && !transactionDTO.getDescription().isBlank()) {
            // Get ChatGPT-derived carbon multiplier based on description
            carbonMultiplierUsed = getCarbonMultiplier(transactionDTO.getCategory().getName(), transactionDTO.getDescription());
        }

        // Apply carbon footprint based on multiplier or default category multiplier
        if (carbonMultiplierUsed != null) {
            double chatGPTCarbonFootprint = transactionDTO.getAmount().doubleValue() * carbonMultiplierUsed;
            transaction.setCarbonFootprint(chatGPTCarbonFootprint);
            transaction.setChatGPTDerivedCarbonFootprint(true);
        } else if (category.getCarbonMultiplier() != null) {
            double defaultCarbonFootprint = transactionDTO.getAmount().doubleValue() * category.getCarbonMultiplier();
            transaction.setCarbonFootprint(defaultCarbonFootprint);
            transaction.setChatGPTDerivedCarbonFootprint(false);
            carbonMultiplierUsed = category.getCarbonMultiplier();
        } else {
            transaction.setCarbonFootprint(null);
            transaction.setChatGPTDerivedCarbonFootprint(false);
        }

        // Save the carbon multiplier used
        transaction.setCarbonMultiplierUsed(carbonMultiplierUsed);

        // Save the new transaction
        Transaction savedTransaction = transactionRepository.save(transaction);
        TransactionDTO responseDTO = convertToDTO(savedTransaction);
        responseDTO.setCarbonMultiplierUsed(carbonMultiplierUsed); // Set the multiplier used

        // Check if the transaction date is within the last 30 days
        if (transaction.getDate().isAfter(LocalDateTime.now().minusDays(30))) {
            user.setTransactionsUpdatedForRecommendations(true);
            user.setTransactionsUpdatedForBenchmarks(true);
            appUserRepository.save(user);
        }

        return responseDTO;
    }

    // Retrieve all transactions and convert them to DTOs
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get transactions for a specific user using email
    public List<TransactionDTO> getTransactionsByUserEmail(String userEmail) {
        // Fetch user by email
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retrieve the user's transactions and convert to DTOs
        List<Transaction> transactions = transactionRepository.findByAppUserId(user.getId());
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Fetch a single transaction by ID
    public Optional<TransactionDTO> getTransactionById(Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);
        return transaction.map(this::convertToDTO); // Return transaction as DTO if found
    }

    // Update an existing transaction
    public TransactionDTO updateTransaction(Long id, TransactionDTO transactionDTO) {
        // Fetch the existing transaction by ID
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Check if the description has changed
        boolean descriptionChanged = !transactionDTO.getDescription().equals(existingTransaction.getDescription());

        // Update the fields of the existing transaction
        existingTransaction.setAmount(transactionDTO.getAmount());
        existingTransaction.setType(transactionDTO.getType());
        existingTransaction.setDate(transactionDTO.getDate());
        existingTransaction.setDescription(transactionDTO.getDescription());

        // Update the category if provided
        if (transactionDTO.getCategory() != null && transactionDTO.getCategory().getId() != null) {
            Category category = categoryRepository.findById(transactionDTO.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID " + transactionDTO.getCategory().getId()));
            existingTransaction.setCategory(category);
        }

        // Recalculate the carbon footprint
        Double carbonMultiplierUsed = existingTransaction.getCarbonMultiplierUsed();
        if (descriptionChanged) {
            // Get ChatGPT-derived carbon multiplier based on new description
            carbonMultiplierUsed = getCarbonMultiplier(existingTransaction.getCategory().getName(), transactionDTO.getDescription());
            existingTransaction.setChatGPTDerivedCarbonFootprint(true);
        }

        if (carbonMultiplierUsed != null) {
            double chatGPTCarbonFootprint = transactionDTO.getAmount().doubleValue() * carbonMultiplierUsed;
            existingTransaction.setCarbonFootprint(chatGPTCarbonFootprint);
        } else if (existingTransaction.getCategory().getCarbonMultiplier() != null) {
            double defaultCarbonFootprint = transactionDTO.getAmount().doubleValue() * existingTransaction.getCategory().getCarbonMultiplier();
            existingTransaction.setCarbonFootprint(defaultCarbonFootprint);
            existingTransaction.setChatGPTDerivedCarbonFootprint(false);
            carbonMultiplierUsed = existingTransaction.getCategory().getCarbonMultiplier();
        } else {
            existingTransaction.setCarbonFootprint(null);
            existingTransaction.setChatGPTDerivedCarbonFootprint(false);
        }

        // Save the carbon multiplier used
        existingTransaction.setCarbonMultiplierUsed(carbonMultiplierUsed);

        // Save and return the updated transaction as a DTO
        Transaction updatedTransaction = transactionRepository.save(existingTransaction);
        TransactionDTO responseDTO = convertToDTO(updatedTransaction);
        responseDTO.setCarbonMultiplierUsed(carbonMultiplierUsed); // Set the multiplier used

        // Check if the transaction date is within the last 30 days
        if (existingTransaction.getDate().isAfter(LocalDateTime.now().minusDays(30))) {
            AppUser user = existingTransaction.getAppUser();
            user.setTransactionsUpdatedForRecommendations(true);
            user.setTransactionsUpdatedForBenchmarks(true);
            appUserRepository.save(user);
        }

        return responseDTO;
    }

    // Delete a transaction by ID
    public void deleteTransaction(Long id) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Check if the transaction date is within the last 30 days
        if (existingTransaction.getDate().isAfter(LocalDateTime.now().minusDays(30))) {
            AppUser user = existingTransaction.getAppUser();
            user.setTransactionsUpdatedForRecommendations(true);
            user.setTransactionsUpdatedForBenchmarks(true);
            appUserRepository.save(user);
        }

        transactionRepository.delete(existingTransaction);
    }

    // Convert a Transaction entity to a DTO
    public TransactionDTO convertToDTO(Transaction transaction) {
        // Convert related Category and AppUser entities to DTOs
        CategoryDTO categoryDTO = new CategoryDTO(
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getCategory().getCarbonMultiplier()
        );
        AppUserDTO appUserDTO = new AppUserDTO(
                transaction.getAppUser().getId(),
                transaction.getAppUser().getFirstName(),
                transaction.getAppUser().getLastName(),
                transaction.getAppUser().getEmail(),
                transaction.getAppUser().getRole().name()
        );

        // Determine the multiplier used for carbon footprint
        Double carbonMultiplierUsed = transaction.isChatGPTDerivedCarbonFootprint()
                ? transaction.getCarbonFootprint() / transaction.getAmount().doubleValue()
                : transaction.getCategory().getCarbonMultiplier();

        // Return a populated TransactionDTO
        return TransactionDTO.builder()
                .id(transaction.getId())
                .appUser(appUserDTO)
                .amount(transaction.getAmount())
                .category(categoryDTO)
                .type(transaction.getType())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .carbonFootprint(transaction.getCarbonFootprint())
                .isChatGPTDerivedCarbonFootprint(transaction.isChatGPTDerivedCarbonFootprint())
                .carbonMultiplierUsed(carbonMultiplierUsed)
                .build();
    }

    // Create a prompt for carbon multiplier
    private String createCarbonMultiplierPrompt(String categoryName, String description) {
        if (description == null || description.isBlank()) {
            return String.format("Provide a single numeric carbon footprint multiplier in kilograms of CO2 per dollar spent for a transaction in the '%s' category. Only provide the numeric multiplier.", categoryName);
        } else {
            return String.format("Provide a single numeric carbon footprint multiplier in kilograms of CO2 per dollar spent for a transaction in the '%s' category. This is a description of the transaction: %s. Only provide the numeric multiplier.", categoryName, description);
        }
    }

    // Get carbon multiplier from ChatGPTService
    public Double getCarbonMultiplier(String categoryName, String description) {
        String prompt = createCarbonMultiplierPrompt(categoryName, description);
        return chatGPTService.getCarbonMultiplier(prompt);
    }
}
