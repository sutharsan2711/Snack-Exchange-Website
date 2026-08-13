package com.foodie.backend.controller;

import com.foodie.backend.entity.Category;
import com.foodie.backend.repository.CategoryRepository;
import com.foodie.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Category> addCategory(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String image = payload.get("image");
        
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        
        if (image == null || image.trim().isEmpty()) {
            image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80"; // Default fallback
        }
        
        // Generate an ID based on name, e.g. "Burger" -> "burger"
        String id = name.toLowerCase().trim().replace(" ", "-");
        
        // Handle duplicate IDs
        if (categoryRepository.existsById(id)) {
            id = id + "-" + System.currentTimeMillis();
        }
        
        Category category = new Category(id, name.trim(), image.trim());
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable String id, @RequestBody Map<String, String> payload) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
                
        String newName = payload.get("name");
        String newImage = payload.get("image");
        
        if (newName == null || newName.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        
        category.setName(newName.trim());
        if (newImage != null && !newImage.trim().isEmpty()) {
            category.setImage(newImage.trim());
        }
        
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
                
        categoryRepository.delete(category);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
