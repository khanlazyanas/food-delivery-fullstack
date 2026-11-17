export type Offer = {
  id: number;
  title: string;
  description: string;
  image: string;
  discount: string;
  category: string;
  startDate: string;                    // 👈 NAYA: schedule start
  validUntil: string;
  terms: string;
  badge: string;
  applicableItems?: string[];           // 👈 NAYA: specific food items (empty = whole category)
  isActive?: boolean;
};

export const offers: Offer[] = [
  {
    id: 1,
    title: "Flat 30% OFF on Main Course",
    description:
      "Get flat 30% off on all main course dishes. Perfect for family dinners.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    discount: "30%",
    category: "Main Course",
    startDate: "2026-10-01",
    validUntil: "2026-12-31",
    terms: "Valid on orders above ₹499. Cannot be clubbed with other offers.",
    badge: "Weekly Special",
    applicableItems: [],
    isActive: true,
  },
  {
    id: 2,
    title: "Buy 1 Get 1 on Starters",
    description:
      "Order any starter and get another one absolutely free. Perfect for sharing.",
    image:
      "https://images.unsplash.com/photo-1625938145312-c9b7bdb54d1a?w=800",
    discount: "BOGO",
    category: "Starters",
    startDate: "2026-10-01",
    validUntil: "2026-12-25",
    terms: "Valid on selected starters only. Dine-in or delivery.",
    badge: "BOGO",
    applicableItems: [],
    isActive: true,
  },
  {
    id: 3,
    title: "Free Dessert Above ₹799",
    description:
      "Get a free Gulab Jamun or Chocolate Brownie on orders above ₹799.",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
    discount: "FREE",
    category: "Desserts",
    startDate: "2026-10-01",
    validUntil: "2026-12-20",
    terms: "One dessert per order. Only on delivery orders.",
    badge: "Free Item",
    applicableItems: [],
    isActive: true,
  },
  {
    id: 4,
    title: "20% OFF on Biryani",
    description:
      "Enjoy 20% off on all biryani varieties. Available on weekends only.",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    discount: "20%",
    category: "Biryani",
    startDate: "2026-10-01",
    validUntil: "2026-12-15",
    terms: "Valid on Saturdays & Sundays only.",
    badge: "Weekend Special",
    applicableItems: [],
    isActive: true,
  },
  {
    id: 5,
    title: "Combo Deal — ₹499",
    description:
      "Paneer Butter Masala + Butter Naan (2) + Jeera Rice at just ₹499.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    discount: "₹499",
    category: "Combo",
    startDate: "2026-10-01",
    validUntil: "2026-12-30",
    terms: "Limited to 2 combos per order.",
    badge: "Combo",
    applicableItems: [
      "Paneer Butter Masala",
      "Butter Naan",
      "Jeera Rice",
    ],
    isActive: true,
  },
  {
    id: 6,
    title: "Free Delivery Above ₹500",
    description:
      "No delivery charges on any order above ₹500. Every day, all day.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    discount: "FREE",
    category: "Delivery",
    startDate: "2026-10-01",
    validUntil: "2026-12-31",
    terms: "Applicable on delivery orders only.",
    badge: "Always On",
    applicableItems: [],
    isActive: true,
  },
  {
    id: 7,
    title: "Free Garlic Naan on ₹399+",
    description:
      "Get 2 pieces of our signature Garlic Naan absolutely free on any order above ₹399.",
    image:
      "https://images.unsplash.com/photo-1633945274309-2c16c9682a8c?w=800",
    discount: "FREE",
    category: "Breads",
    startDate: "2026-10-01",
    validUntil: "2026-12-28",
    terms: "One-time per order. Cannot be clubbed with combo offers.",
    badge: "Bread Lovers",
    applicableItems: ["Garlic Naan"],
    isActive: true,
  },
  {
    id: 8,
    title: "15% OFF on Beverages",
    description:
      "Cool down with 15% off on all our refreshing beverages and mocktails.",
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
    discount: "15%",
    category: "Beverages",
    startDate: "2026-10-01",
    validUntil: "2026-12-22",
    terms: "Valid on all beverage items. No minimum order value.",
    badge: "Summer Cooler",
    applicableItems: [],
    isActive: true,
  },
  {
    id: 9,
    title: "Family Feast — ₹999",
    description:
      "Butter Chicken + 4 Butter Naan + Dal Makhani + 2 Rasmalai at just ₹999. Serves 4.",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800",
    discount: "₹999",
    category: "Combo",
    startDate: "2026-10-01",
    validUntil: "2026-12-31",
    terms: "Limited to 1 family combo per order. Dine-in and delivery.",
    badge: "Family Pack",
    applicableItems: [
      "Butter Chicken",
      "Butter Naan",
      "Dal Makhani",
      "Rasmalai",
    ],
    isActive: true,
  },
  {
    id: 10,
    title: "Flat ₹100 OFF First Order",
    description:
      "New to FoodieHub? Get flat ₹100 off on your very first order. Welcome aboard!",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    discount: "₹100",
    category: "First Order",
    startDate: "2026-10-01",
    validUntil: "2026-12-31",
    terms: "Valid only on first order. Minimum order value ₹299.",
    badge: "New User",
    applicableItems: [],
    isActive: true,
  },
];