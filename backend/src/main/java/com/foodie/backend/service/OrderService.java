package com.foodie.backend.service;

import com.foodie.backend.dto.OrderItemRequest;
import com.foodie.backend.dto.OrderRequest;
import com.foodie.backend.entity.FoodItem;
import com.foodie.backend.entity.Order;
import com.foodie.backend.entity.OrderItem;
import com.foodie.backend.exception.ResourceNotFoundException;
import com.foodie.backend.repository.FoodItemRepository;
import com.foodie.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final Random random = new Random();

    @Autowired
    public OrderService(OrderRepository orderRepository, FoodItemRepository foodItemRepository) {
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @Transactional
    public Order placeOrder(OrderRequest request) {
        // Generate mock order ID starting with FDE-
        String orderId = "FDE-" + (100000 + random.nextInt(900000));

        // Create main Order entity
        Order order = new Order();
        order.setId(orderId);
        order.setRestaurantId(request.getRestaurantId());
        order.setRestaurantName(request.getRestaurantName());
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());

        // Validate items and build OrderItem list
        List<OrderItem> orderItems = new ArrayList<>();
        double calculatedSubtotal = 0;

        for (OrderItemRequest itemReq : request.getItems()) {
            FoodItem foodItem = foodItemRepository.findById(itemReq.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + itemReq.getFoodId()));

            // Verify food item belongs to the restaurant
            if (!foodItem.getRestaurantId().equals(request.getRestaurantId())) {
                throw new IllegalArgumentException("Food item " + foodItem.getName() + " does not belong to restaurant " + request.getRestaurantName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFoodItem(foodItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(foodItem.getPrice()); // Snapshot pricing

            orderItems.add(orderItem);
            calculatedSubtotal += foodItem.getPrice() * itemReq.getQuantity();
        }

        // Apply billing math to double check validity
        double deliveryFee = calculatedSubtotal > 0 ? 30 : 0;
        double tax = Math.round(calculatedSubtotal * 0.05);
        double total = calculatedSubtotal + deliveryFee + tax;

        // Persist values calculated backend-side for security
        order.setSubtotal(calculatedSubtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTax(tax);
        order.setTotal(total);
        order.setItems(orderItems);

        // Save order (Cascades OrderItems automatically due to CascadeType.ALL)
        return orderRepository.save(order);
     }

     public List<Order> getAllOrders() {
         return orderRepository.findAll();
     }

     @Transactional
     public Order updateOrderStatus(String orderId, String status) {
         Order order = orderRepository.findById(orderId)
                 .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
         order.setStatus(status);
         return orderRepository.save(order);
     }
}
