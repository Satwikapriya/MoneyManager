package com.example.financemgr.service;

import com.example.financemgr.model.Transaction;
import com.example.financemgr.repo.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {
    private final TransactionRepository repo;

    public TransactionService(TransactionRepository repo) {
        this.repo = repo;
    }

    public List<Transaction> getAll() {
        return repo.findAll();
    }

    public Optional<Transaction> getById(Long id) {
        return repo.findById(id);
    }

    public Transaction save(Transaction t) {
        return repo.save(t);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public Double getBalance() {
        return repo.findAll().stream()
                .mapToDouble(t -> "income".equalsIgnoreCase(t.getType()) ? t.getAmount() : -t.getAmount())
                .sum();
    }
}
