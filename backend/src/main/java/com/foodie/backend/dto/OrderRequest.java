package com.foodie.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class OrderRequest {

    @NotBlank(message = "Restaurant ID is required")
    private String restaurantId;

    @NotBlank(message = "Restaurant Name is required")
    private String restaurantName;

    @NotBlank(message = "Delivery address is required")
    private String address;

    @NotEmpty(message = "Cart cannot be empty")
    @Valid
    private List<OrderItemRequest> items;

    @NotNull(message = "Subtotal is required")
    @Min(value = 0, message = "Subtotal cannot be negative")
    private Double subtotal;

    @NotNull(message = "Delivery fee is required")
    @Min(value = 0, message = "Delivery fee cannot be negative")
    private Double deliveryFee;

    @NotNull(message = "Tax is required")
    @Min(value = 0, message = "Tax cannot be negative")
    private Double tax;

    @NotNull(message = "Total is required")
    @Min(value = 0, message = "Total cannot be negative")
    private Double total;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    // Constructors
    public OrderRequest() {
    }

    public OrderRequest(String restaurantId, String restaurantName, String address, List<OrderItemRequest> items, Double subtotal, Double deliveryFee, Double tax, Double total, String paymentMethod) {
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.address = address;
        this.items = items;
        this.subtotal = subtotal;
        this.deliveryFee = deliveryFee;
        this.tax = tax;
        this.total = total;
        this.paymentMethod = paymentMethod;
    }

    // Getters and Setters
    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public Double getTax() {
        return tax;
    }

    public void setTax(Double tax) {
        this.tax = tax;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
