package com.example.financemgr.controller;

import com.example.financemgr.model.Transaction;
import com.example.financemgr.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {
    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Transaction> all() {
        return service.getAll();
    }

    @GetMapping("/balance")
    public ResponseEntity<Double> balance() {
        return ResponseEntity.ok(service.getBalance());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getOne(@PathVariable Long id) {
        return service.getById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody Transaction t) {
        return ResponseEntity.ok(service.save(t));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable Long id, @RequestBody Transaction t) {
        return service.getById(id).map(existing -> {
            existing.setTitle(t.getTitle());
            existing.setAmount(t.getAmount());
            existing.setType(t.getType());
            existing.setCategory(t.getCategory());
            existing.setDate(t.getDate());
            return ResponseEntity.ok(service.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
