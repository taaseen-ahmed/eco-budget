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

    // Create a new transaction for the authenticated user
    public TransactionDTO createTransaction(TransactionDTO transactionDTO, String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(transactionDTO.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Transaction transaction = new Transaction();
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setType(transactionDTO.getType());
        transaction.setDate(transactionDTO.getDate());
        transaction.setDescription(transactionDTO.getDescription());
        transaction.setCategory(category);
        transaction.setAppUser(user);

        // Calculate carbon footprint if the category has a multiplier
        if (category.getCarbonMultiplier() != null) {
            transaction.setCarbonFootprint(transactionDTO.getAmount().doubleValue() * category.getCarbonMultiplier());
        } else {
            transaction.setCarbonFootprint(null); // No footprint if the category multiplier is null
        }

        Transaction savedTransaction = transactionRepository.save(transaction);
        return convertToDTO(savedTransaction);
    }

    // Retrieve all transactions and convert to DTOs
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::convertToDTO) // Convert each transaction to a DTO
                .collect(Collectors.toList());
    }

    // Get transactions for a specific user using email
    public List<TransactionDTO> getTransactionsByUserEmail(String userEmail) {
        // Fetch user by email
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retrieve the user's transactions
        List<Transaction> transactions = transactionRepository.findByAppUserId(user.getId());
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Fetch a single transaction by ID
    public Optional<TransactionDTO> getTransactionById(Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);
        return transaction.map(this::convertToDTO);
    }

    // Update an existing transaction
    public TransactionDTO updateTransaction(Long id, TransactionDTO transactionDTO) {
        // Fetch the existing transaction
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

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

        // Save the updated transaction
        Transaction updatedTransaction = transactionRepository.save(existingTransaction);

        // Convert to DTO and return
        return convertToDTO(updatedTransaction);
    }

    // Delete a transaction by ID
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    // Convert a Transaction entity to a DTO
    public TransactionDTO convertToDTO(Transaction transaction) {
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

        return TransactionDTO.builder()
                .id(transaction.getId())
                .appUser(appUserDTO)
                .amount(transaction.getAmount())
                .category(categoryDTO)
                .type(transaction.getType())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .carbonFootprint(transaction.getCarbonFootprint()) // Include the carbon footprint
                .build();
    }
}
