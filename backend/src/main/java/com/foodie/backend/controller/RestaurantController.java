package com.foodie.backend.controller;

import com.foodie.backend.entity.FoodItem;
import com.foodie.backend.entity.Restaurant;
import com.foodie.backend.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @Autowired
    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable String id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable String id, @RequestBody Restaurant updatedRestaurant) {
        Restaurant existing = restaurantService.getRestaurantById(id);
        existing.setName(updatedRestaurant.getName());
        existing.setImage(updatedRestaurant.getImage());
        existing.setAddress(updatedRestaurant.getAddress());
        existing.setDeliveryTime(updatedRestaurant.getDeliveryTime());
        existing.setPriceRange(updatedRestaurant.getPriceRange());
        existing.setRating(updatedRestaurant.getRating());
        
        if (updatedRestaurant.getCuisines() != null) {
            existing.setCuisines(updatedRestaurant.getCuisines());
        }
        
        return ResponseEntity.ok(restaurantService.saveRestaurant(existing));
    }

    @GetMapping("/{id}/foods")
    public ResponseEntity<List<FoodItem>> getFoodsByRestaurantId(@PathVariable String id) {
        return ResponseEntity.ok(restaurantService.getFoodsByRestaurantId(id));
    }
}
