package com.taaseenahmed.eco_budget.controller;

import com.taaseenahmed.eco_budget.dto.response.TransactionDTO;
import com.taaseenahmed.eco_budget.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(path = "/api/transaction") // Base URL for all transaction-related endpoints.
@RequiredArgsConstructor // Automatically generates a constructor for final fields (Dependency Injection).
public class TransactionController {

    private final TransactionService transactionService; // Service handling transaction logic.

    // Endpoint to create a new transaction for the authenticated user.
    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionDTO transactionDTO, Principal principal) {
        TransactionDTO response = transactionService.createTransaction(transactionDTO, principal.getName());
        String source = response.getIsChatGPTDerivedCarbonFootprint() ? "ChatGPT" : "default category multiplier";
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("X-Carbon-Footprint-Source", source) // Custom header for source notification
                .body(response); // Return the created transaction in the response body
    }

    // Fetch transactions for the authenticated user using their email (from the JWT token or session)
    @GetMapping("/user")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByAuthenticatedUser(Principal principal) {
        // Retrieve transactions associated with the authenticated user
        List<TransactionDTO> transactionDTOList = transactionService.getTransactionsByUserEmail(principal.getName());
        return ResponseEntity.ok(transactionDTOList); // Return the list of transactions
    }

    // Endpoint to fetch all transactions in the system.
    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        // Fetch all transactions from the service
        List<TransactionDTO> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions); // Return the list of all transactions
    }

    // Endpoint to fetch a single transaction by its ID.
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        // Fetch a single transaction by its ID
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok) // Return the transaction DTO if found.
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found")); // Handle not found case.
    }

    // Endpoint to update an existing transaction by its ID.
    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(@PathVariable Long id, @Valid @RequestBody TransactionDTO transactionDTO) {
        // Update an existing transaction and return the updated DTO
        TransactionDTO updatedTransaction = transactionService.updateTransaction(id, transactionDTO);
        return ResponseEntity.ok(updatedTransaction); // Return the updated transaction
    }

    // Endpoint to delete a transaction by its ID.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        // Delete the transaction by its ID
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build(); // Return 204 No Content status on successful deletion.
    }
}
