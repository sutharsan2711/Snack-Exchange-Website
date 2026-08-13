import type { FoodItem } from './food';


export interface CartItem {
  food: FoodItem;
  quantity: number;
}
