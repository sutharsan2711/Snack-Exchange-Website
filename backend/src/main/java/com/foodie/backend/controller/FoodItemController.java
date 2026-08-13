package com.foodie.backend.controller;

import com.foodie.backend.entity.FoodItem;
import com.foodie.backend.entity.Restaurant;
import com.foodie.backend.repository.FoodItemRepository;
import com.foodie.backend.repository.RestaurantRepository;
import com.foodie.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/foods")
public class FoodItemController {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    @Autowired
    public FoodItemController(FoodItemRepository foodItemRepository, RestaurantRepository restaurantRepository) {
        this.foodItemRepository = foodItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @GetMapping
    public ResponseEntity<List<FoodItem>> getAllFoods() {
        return ResponseEntity.ok(foodItemRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<FoodItem> addFood(@RequestBody Map<String, Object> payload) {
        String id = "f-" + System.currentTimeMillis();
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        double price = Double.parseDouble(payload.get("price").toString());
        String image = (String) payload.get("image");
        double rating = payload.containsKey("rating") ? Double.parseDouble(payload.get("rating").toString()) : 5.0;
        String category = (String) payload.get("category");
        boolean isVeg = (Boolean) payload.get("isVeg");
        
        Restaurant restaurant = restaurantRepository.findById("gourmet-bistro")
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
                
        FoodItem foodItem = new FoodItem(id, restaurant, name, description, price, image, rating, category, isVeg);
        return ResponseEntity.ok(foodItemRepository.save(foodItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateFood(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
                
        foodItem.setName((String) payload.get("name"));
        foodItem.setDescription((String) payload.get("description"));
        foodItem.setPrice(Double.parseDouble(payload.get("price").toString()));
        foodItem.setImage((String) payload.get("image"));
        if (payload.containsKey("rating")) {
            foodItem.setRating(Double.parseDouble(payload.get("rating").toString()));
        }
        foodItem.setCategory((String) payload.get("category"));
        foodItem.setVeg((Boolean) payload.get("isVeg"));
        
        return ResponseEntity.ok(foodItemRepository.save(foodItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFood(@PathVariable String id) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
        foodItemRepository.delete(foodItem);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
