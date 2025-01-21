package com.taaseenahmed.eco_budget.Transaction;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserDTO;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.Category.Category;
import com.taaseenahmed.eco_budget.Category.CategoryDTO;
import com.taaseenahmed.eco_budget.Category.CategoryRepository;
import com.taaseenahmed.eco_budget.Config.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

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
            carbonMultiplierUsed = chatGPTService.getCarbonMultiplier(
                    transactionDTO.getCategory().getName(),
                    transactionDTO.getDescription()
            );
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
            carbonMultiplierUsed = chatGPTService.getCarbonMultiplier(
                    existingTransaction.getCategory().getName(),
                    transactionDTO.getDescription()
            );
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
        return responseDTO;
    }

    // Delete a transaction by ID
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id); // Delete the transaction
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
}
