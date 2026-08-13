package com.foodie.backend.service;

import com.foodie.backend.entity.FoodItem;
import com.foodie.backend.entity.Restaurant;
import com.foodie.backend.exception.ResourceNotFoundException;
import com.foodie.backend.repository.FoodItemRepository;
import com.foodie.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;

    @Autowired
    public RestaurantService(RestaurantRepository restaurantRepository, FoodItemRepository foodItemRepository) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(String id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));
    }

    public List<FoodItem> getFoodsByRestaurantId(String restaurantId) {
        // First check if restaurant exists
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId);
        }
        return foodItemRepository.findByRestaurantId(restaurantId);
    }

    public Restaurant saveRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
}
