package com.taaseenahmed.eco_budget.Transaction;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserDTO;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.Config.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AppUserRepository appUserRepository;

    // Create a new transaction for the authenticated user
    public TransactionDTO createTransaction(Transaction transaction, String userEmail) {
        // Fetch the user by email
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Associate the user with the transaction
        transaction.setAppUser(user);

        // Save the transaction and create a DTO for response
        Transaction savedTransaction = transactionRepository.save(transaction);
        AppUserDTO appUserDTO = buildAppUserDTO(user);

        return buildTransactionDTO(savedTransaction, appUserDTO);
    }

    // Retrieve all transactions and convert to DTOs
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::convertToDTO) // Convert each transaction to a DTO
                .collect(Collectors.toList());
    }

    // Convert a transaction entity to a DTO
    private TransactionDTO convertToDTO(Transaction transaction) {
        AppUser appUser = transaction.getAppUser();
        AppUserDTO appUserDTO = buildAppUserDTO(appUser);

        return new TransactionDTO(
                transaction.getId().intValue(),
                appUserDTO,
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getType(),
                transaction.getDate(),
                transaction.getDescription()
        );
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

    // Get transactions for a specific user
    public List<TransactionDTO> getTransactionsByUserId(Integer userId) {
        List<Transaction> transactions = transactionRepository.findByAppUserId(userId);
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Update an existing transaction
    public TransactionDTO updateTransaction(Long id, Transaction transaction) {
        // Ensure the transaction exists
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Preserve the original user's relationship and save the updated transaction
        transaction.setId(existingTransaction.getId());
        transaction.setAppUser(existingTransaction.getAppUser());
        Transaction updatedTransaction = transactionRepository.save(transaction);

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
        return TransactionDTO.builder()
                .id(transaction.getId().intValue())
                .appUser(appUserDTO)
                .amount(transaction.getAmount())
                .category(transaction.getCategory())
                .type(transaction.getType())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .build();
    }
}