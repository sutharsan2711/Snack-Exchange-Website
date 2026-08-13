package com.foodie.backend.config;

import com.foodie.backend.entity.FoodItem;
import com.foodie.backend.entity.Restaurant;
import com.foodie.backend.entity.Category;
import com.foodie.backend.repository.FoodItemRepository;
import com.foodie.backend.repository.RestaurantRepository;
import com.foodie.backend.repository.CategoryRepository;
import com.foodie.backend.repository.OrderRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final EntityManager entityManager;

    @Autowired
    public DatabaseInitializer(RestaurantRepository restaurantRepository, FoodItemRepository foodItemRepository, CategoryRepository categoryRepository, OrderRepository orderRepository, EntityManager entityManager) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Clear old seeded data to ensure transition to single restaurant (clearing in order of FK constraints)
        orderRepository.deleteAll();
        foodItemRepository.deleteAll();
        restaurantRepository.deleteAll();
        categoryRepository.deleteAll();

        // Seed Default Categories
        List<Category> defaultCategories = Arrays.asList(
                new Category("burger", "Burger", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80"),
                new Category("pizza", "Pizza", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=80"),
                new Category("biryani", "Biryani", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&auto=format&fit=crop&q=80"),
                new Category("chinese", "Chinese", "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&auto=format&fit=crop&q=80"),
                new Category("south-indian", "South Indian", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=100&auto=format&fit=crop&q=80"),
                new Category("north-indian", "North Indian", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100&auto=format&fit=crop&q=80"),
                new Category("desserts", "Desserts", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&auto=format&fit=crop&q=80"),
                new Category("drinks", "Drinks", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100&auto=format&fit=crop&q=80")
        );
        defaultCategories.forEach(entityManager::persist);

        // 1. Initialize Single Restaurant: Snake Exchange
        Restaurant gourmetBistro = new Restaurant(
                "gourmet-bistro",
                "Snake Exchange",
                "/hero.png",
                4.8,
                Arrays.asList("Burgers", "Pizza", "North Indian", "South Indian", "Chinese", "Desserts", "Beverages"),
                25,
                "₹250 for two",
                "101, Snake Exchange Lane, Sector 5, City Center",
                true
        );

        entityManager.persist(gourmetBistro);

        // 2. Initialize Foods (all mapped to gourmetBistro)
        List<FoodItem> foodList = Arrays.asList(
                // Burger House Category
                new FoodItem("fb-1", gourmetBistro, "Chicken Burger", "Juicy chicken patty, melted cheddar cheese, fresh lettuce, tomato, and house burger sauce.", 149.0, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", 4.5, "Burger", false),
                new FoodItem("fb-2", gourmetBistro, "Cheese Burger", "Classic grilled beef patty (mock) with double cheddar, sweet pickles, onions, mustard, and ketchup.", 179.0, "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80", 4.4, "Burger", true),
                new FoodItem("fb-3", gourmetBistro, "Veg Burger", "Crispy potato patty with fresh lettuce, red onion, vine tomatoes, and creamy garlic mayonnaise.", 129.0, "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80", 4.2, "Burger", true),
                new FoodItem("fb-4", gourmetBistro, "Onion Rings", "Golden-fried breaded onion rings (8 pcs) served with smoky BBQ dip.", 89.0, "https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=600&auto=format&fit=crop&q=80", 4.0, "Burger", true),
                new FoodItem("fb-5", gourmetBistro, "Chicken Wings", "Spicy barbecue glazed chicken wings (6 pcs) served with cool ranch dressing.", 199.0, "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80", 4.4, "Burger", false),

                // Pizza Corner Category
                new FoodItem("fp-1", gourmetBistro, "Margherita Pizza", "Classic sourdough crust topped with rich tomato marinara, fresh mozzarella, extra virgin olive oil, and sweet basil.", 249.0, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80", 4.6, "Pizza", true),
                new FoodItem("fp-2", gourmetBistro, "Paneer Pizza", "Spiced tandoori paneer cubes, diced capsicum, red onion, green chillies, and premium mozzarella cheese.", 229.0, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80", 4.3, "Pizza", true),
                new FoodItem("fp-3", gourmetBistro, "Chicken Pizza", "Grilled BBQ chicken breast chunks, black olives, sliced jalapenos, and onions over rich marinara.", 299.0, "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", 4.5, "Pizza", false),
                new FoodItem("fp-4", gourmetBistro, "Garlic Bread with Cheese", "Toasted artisan baguette slices rubbed with garlic butter and topped with melted mozzarella.", 119.0, "https://images.unsplash.com/photo-1573145959956-e9fae6b8cd4e?w=600&auto=format&fit=crop&q=80", 4.3, "Pizza", true),
                new FoodItem("fp-5", gourmetBistro, "Veg Supreme Pizza", "Loaded with button mushrooms, red onions, colorful bell peppers, sweet corn, black olives, and mozzarella.", 279.0, "https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=600&auto=format&fit=crop&q=80", 4.4, "Pizza", true),

                // Royal Biryani Category
                new FoodItem("fbir-1", gourmetBistro, "Chicken Biryani", "Aromatic long-grain Basmati rice layered with marinated chicken, saffron, fried onions, and fresh mint.", 199.0, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80", 4.8, "Biryani", false),
                new FoodItem("fbir-2", gourmetBistro, "Mutton Biryani", "Tender baby goat pieces cooked in rich spices, slow-dum styled with premium basmati rice and cardamoms.", 299.0, "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80", 4.9, "Biryani", false),
                new FoodItem("fbir-3", gourmetBistro, "Veg Dum Biryani", "Seasonal fresh garden vegetables marinated in spiced yogurt and layered with aromatic basmati rice.", 159.0, "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80", 4.4, "Biryani", true),
                new FoodItem("fbir-4", gourmetBistro, "Chicken Tikka", "Boneless chicken cubes marinated in tandoori spices and grilled over coal (6 pcs) with mint chutney.", 220.0, "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80", 4.6, "Biryani", false),
                new FoodItem("fbir-5", gourmetBistro, "Egg Biryani", "Fragrant basmati biryani rice served with two hard-boiled eggs in spicy gravy.", 169.0, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", 4.3, "Biryani", false),

                // Wok Express Category
                new FoodItem("fch-1", gourmetBistro, "Veg Noodles", "Wok-tossed hakka noodles with julienned cabbage, carrots, bell peppers, and scallions in light soy sauce.", 159.0, "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80", 4.1, "Chinese", true),
                new FoodItem("fch-2", gourmetBistro, "Chicken Noodles", "Wok-tossed noodles with shredded chicken breast, scrambled egg, vegetables, and savory oyster sauce.", 189.0, "https://images.unsplash.com/photo-1612966608967-30a5b9ad11df?w=600&auto=format&fit=crop&q=80", 4.3, "Chinese", false),
                new FoodItem("fch-3", gourmetBistro, "Fried Rice", "Steamed rice stir-fried in a hot wok with fresh vegetables, garlic, spring onions, and light soy sauce.", 169.0, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80", 4.2, "Chinese", true),

                // South Indian Kitchen Category
                new FoodItem("fsi-1", gourmetBistro, "Masala Dosa", "Golden, crispy rice and lentil crepe stuffed with spiced potato mash, served with piping hot Sambar and coconut-tomato chutneys.", 80.0, "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", 4.7, "South Indian", true),
                new FoodItem("fsi-2", gourmetBistro, "Steam Idli", "Super soft, fluffy steamed rice-lentil cakes (2 pcs) served with traditional sambar and creamy coconut chutney.", 60.0, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", 4.5, "South Indian", true),
                new FoodItem("fsi-3", gourmetBistro, "Onion Uttapam", "Thick savory pancake topped with finely chopped red onions, green chillies, cilantro, and brushed with ghee.", 90.0, "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80", 4.5, "South Indian", true),
                new FoodItem("fsi-4", gourmetBistro, "Vada", "Crispy deep-fried lentil donuts (2 pcs) flavored with black pepper and ginger, served with fresh coconut chutney.", 60.0, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", 4.4, "South Indian", true),

                // Spice Kitchen Category
                new FoodItem("fni-1", gourmetBistro, "Paneer Butter Masala", "Fresh cottage cheese cubes cooked in a velvety tomato-cream gravy with mild Indian spices.", 220.0, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", 4.5, "North Indian", true),
                new FoodItem("fni-2", gourmetBistro, "Butter Naan", "Classic Indian flatbread made of refined flour, baked inside a clay tandoor and generousy glazed with fresh butter.", 40.0, "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80", 4.6, "North Indian", true),
                new FoodItem("fni-3", gourmetBistro, "Dal Makhani", "Creamy black lentils and red kidney beans, simmered overnight with butter, cream, and warm spices.", 180.0, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", 4.5, "North Indian", true),
                new FoodItem("fni-4", gourmetBistro, "Kadhai Chicken", "Spicy and flavorful chicken pieces tossed with thick bell peppers, onions, tomatoes, and freshly ground kadhai masala.", 260.0, "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80", 4.4, "North Indian", false),

                // Sweet Treats Category
                new FoodItem("fde-1", gourmetBistro, "Chocolate Cake", "Fudge-filled double-deck chocolate sponge cake slice, topped with rich chocolate ganache.", 129.0, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80", 4.6, "Desserts", true),
                new FoodItem("fde-2", gourmetBistro, "Ice Cream", "Premium double scoop ice cream. Choose from Madagascan Vanilla, Dark Belgian Chocolate, or Alphonso Mango.", 99.0, "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80", 4.4, "Desserts", true),
                new FoodItem("fde-3", gourmetBistro, "Waffle with Maple Syrup", "Crisp, golden Belgian waffle dusted with powdered sugar and drizzled with maple syrup.", 149.0, "https://images.unsplash.com/photo-1562376502-6f769499c886?w=600&auto=format&fit=crop&q=80", 4.5, "Desserts", true),

                // Cafe Coffee & Drinks Category
                new FoodItem("fdr-1", gourmetBistro, "Fresh Lime Soda", "Zesty fresh key lime juice blended with soda water. Choice of Sweet, Salted, or Mixed.", 79.0, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80", 4.1, "Drinks", true),
                new FoodItem("fdr-2", gourmetBistro, "Mango Juice", "Thick, sweet, fresh pulp juice made from choice sun-ripened Alphonso mangoes.", 99.0, "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80", 4.5, "Drinks", true),
                new FoodItem("fdr-3", gourmetBistro, "Cold Coffee", "Classic double-shot espresso blended with chilled milk, sugar, and topped with a scoop of vanilla ice cream.", 119.0, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80", 4.6, "Drinks", true),
                new FoodItem("fdr-4", gourmetBistro, "Iced Peach Tea", "Chilled black tea infused with sweet peach syrup, sliced peaches, and fresh mint leaves.", 89.0, "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80", 4.2, "Drinks", true),

                // Healthy Greens Category
                new FoodItem("fh-1", gourmetBistro, "Caesar Salad", "Crisp romaine lettuce tossed in caesar dressing, garlic herb croutons, and grated parmesan cheese.", 179.0, "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80", 4.3, "Salads", true),
                new FoodItem("fh-2", gourmetBistro, "Avocado Salad", "Diced avocado, cucumbers, cherry tomatoes, and red onions with a simple lemon-olive oil dressing.", 219.0, "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80", 4.5, "Salads", true)
        );

        foodList.forEach(entityManager::persist);
    }
}
