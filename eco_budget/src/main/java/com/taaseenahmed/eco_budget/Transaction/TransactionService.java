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
    public TransactionDTO createTransaction(Transaction transaction, String userEmail) {
        // Fetch the user by email
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Associate the user with the transaction
        transaction.setAppUser(user);

        // Fetch the Category entity and associate it with the transaction
        Long categoryId = transaction.getCategory().getId(); // Assuming the ID is provided in the request
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        transaction.setCategory(category);

        Transaction savedTransaction = transactionRepository.save(transaction);
        return buildTransactionDTO(savedTransaction, buildAppUserDTO(user));
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

    // Convert a transaction entity to a DTO
    public TransactionDTO convertToDTO(Transaction transaction) {
        AppUser appUser = transaction.getAppUser();
        AppUserDTO appUserDTO = buildAppUserDTO(appUser);

        // Convert Category to CategoryDTO
        CategoryDTO categoryDTO = transaction.getCategory() != null
                ? new CategoryDTO(transaction.getCategory().getId(), transaction.getCategory().getName())
                : null;

        return TransactionDTO.builder()
                .id(transaction.getId())
                .appUser(appUserDTO)
                .amount(transaction.getAmount())
                .category(categoryDTO)
                .type(transaction.getType())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .build();
    }

    // Get a transaction by its ID
    public Optional<TransactionDTO> getTransactionById(Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);
        return transaction.map(t -> buildTransactionDTO(t, convertToAppUserDTO(t.getAppUser())));
    }

    // Helper method to convert AppUser to AppUserDTO
    private AppUserDTO convertToAppUserDTO(AppUser user) {
        return AppUserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
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

    // Helper method to build AppUserDTO
    private AppUserDTO buildAppUserDTO(AppUser user) {
        return AppUserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // Helper method to build TransactionDTO
    private TransactionDTO buildTransactionDTO(Transaction transaction, AppUserDTO appUserDTO) {
        // Convert Category to CategoryDTO
        CategoryDTO categoryDTO = transaction.getCategory() != null
                ? new CategoryDTO(transaction.getCategory().getId(), transaction.getCategory().getName())
                : null;

        return TransactionDTO.builder()
                .id(transaction.getId())
                .appUser(appUserDTO)
                .amount(transaction.getAmount())
                .category(categoryDTO) // Pass the CategoryDTO here
                .type(transaction.getType())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .build();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
}