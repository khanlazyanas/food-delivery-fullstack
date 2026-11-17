export type Variant = {
  name: string;
  price: number;
};

export type AddOn = {
  name: string;
  price: number;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
  isVeg: boolean;
  isBestseller: boolean;
  rating: number;
  isAvailable?: boolean;
  variants?: Variant[];
  addOns?: AddOn[];
};

// 👇 NAYA TYPE: Category Management ke liye
export type Category = {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  subcategories: string[];
};

export const menuItems: MenuItem[] = [
  // ... (Tumhare saare 16 menu items same rahenge, maine neeche copy kar diye hain)
  {
    id: 1,
    name: "Veg Spring Rolls",
    description:
      "Crispy golden rolls stuffed with fresh vegetables and noodles, served with sweet chili dip.",
    price: 160,
    image:
      "https://images.unsplash.com/photo-1625938145312-c9b7bdb54d1a?w=800",
    category: "Starters",
    subcategory: "Veg Starters",
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    variants: [
      { name: "4 pcs", price: 160 },
      { name: "8 pcs", price: 300 },
    ],
    addOns: [
      { name: "Extra Dip", price: 20 },
      { name: "Cheese Dip", price: 40 },
    ],
  },
  {
    id: 2,
    name: "Chicken Tandoori",
    description:
      "Smoky tandoori chicken marinated overnight in yogurt, lemon, and hand-picked spices.",
    price: 340,
    image:
      "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=800",
    category: "Starters",
    subcategory: "Tandoori",
    isVeg: false,
    isBestseller: true,
    rating: 4.9,
    variants: [
      { name: "Half", price: 340 },
      { name: "Full", price: 620 },
    ],
    addOns: [
      { name: "Green Chutney", price: 20 },
      { name: "Onion Salad", price: 30 },
    ],
  },
  {
    id: 3,
    name: "Paneer Tikka",
    description:
      "Marinated paneer cubes grilled with capsicum and onion, served with mint chutney.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800",
    category: "Starters",
    subcategory: "Tandoori",
    isVeg: true,
    isBestseller: true,
    rating: 4.8,
    variants: [
      { name: "Half", price: 280 },
      { name: "Full", price: 480 },
    ],
    addOns: [
      { name: "Extra Chutney", price: 20 },
      { name: "Lemon Wedges", price: 10 },
    ],
  },
  {
    id: 4,
    name: "Paneer Butter Masala",
    description:
      "Rich and creamy paneer curry cooked with authentic Indian spices, tomatoes, and butter. Best enjoyed with naan or rice.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    category: "Main Course",
    subcategory: "Veg Curries",
    isVeg: true,
    isBestseller: true,
    rating: 4.7,
    variants: [
      { name: "Half", price: 280 },
      { name: "Full", price: 480 },
    ],
    addOns: [
      { name: "Extra Gravy", price: 40 },
      { name: "Butter Naan (2 pcs)", price: 60 },
      { name: "Jeera Rice", price: 80 },
    ],
  },
  {
    id: 5,
    name: "Dal Makhani",
    description:
      "Slow-cooked black lentils simmered overnight with butter, cream, and mild spices.",
    price: 240,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
    category: "Main Course",
    subcategory: "Veg Curries",
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    variants: [
      { name: "Half", price: 240 },
      { name: "Full", price: 420 },
    ],
    addOns: [
      { name: "Extra Butter", price: 30 },
      { name: "Jeera Rice", price: 80 },
    ],
  },
  {
    id: 6,
    name: "Butter Chicken",
    description:
      "Tender chicken pieces cooked in a rich, creamy tomato-butter gravy with aromatic spices.",
    price: 340,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800",
    category: "Main Course",
    subcategory: "Non-Veg Curries",
    isVeg: false,
    isBestseller: true,
    rating: 4.9,
    variants: [
      { name: "Half", price: 340 },
      { name: "Full", price: 580 },
    ],
    addOns: [
      { name: "Extra Gravy", price: 50 },
      { name: "Butter Naan (2 pcs)", price: 60 },
    ],
  },
  {
    id: 7,
    name: "Chicken Biryani",
    description:
      "Aromatic basmati rice slow-cooked with tender chicken, saffron, and traditional Hyderabadi spices.",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    category: "Biryani",
    subcategory: "Chicken",
    isVeg: false,
    isBestseller: true,
    rating: 4.8,
    variants: [
      { name: "Half", price: 320 },
      { name: "Full", price: 580 },
    ],
    addOns: [
      { name: "Extra Raita", price: 40 },
      { name: "Boiled Egg", price: 30 },
      { name: "Mirchi Salan", price: 50 },
    ],
  },
  {
    id: 8,
    name: "Veg Dum Biryani",
    description:
      "Fragrant basmati rice layered with seasonal vegetables, saffron, and whole spices, dum-cooked.",
    price: 260,
    image:
      "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800",
    category: "Biryani",
    subcategory: "Veg",
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
    variants: [
      { name: "Half", price: 260 },
      { name: "Full", price: 460 },
    ],
    addOns: [
      { name: "Extra Raita", price: 40 },
      { name: "Papad", price: 20 },
    ],
  },
  {
    id: 9,
    name: "Butter Naan",
    description:
      "Soft tandoor-baked flatbread brushed with generous butter. Perfect with any curry.",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1619158401201-8fa932695178?w=800",
    category: "Breads",
    subcategory: "Naan",
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    variants: [
      { name: "2 pcs", price: 60 },
      { name: "4 pcs", price: 110 },
    ],
  },
  {
    id: 10,
    name: "Garlic Naan",
    description:
      "Tandoor-baked flatbread topped with fresh garlic, coriander, and butter.",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1633945274309-2c16c9682a8c?w=800",
    category: "Breads",
    subcategory: "Naan",
    isVeg: true,
    isBestseller: true,
    rating: 4.7,
    variants: [
      { name: "2 pcs", price: 80 },
      { name: "4 pcs", price: 150 },
    ],
  },
  {
    id: 11,
    name: "Gulab Jamun",
    description:
      "Soft milk dumplings soaked in warm rose-scented sugar syrup. A classic Indian dessert.",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1601303516534-bf0b1a1b1a1a?w=800",
    category: "Desserts",
    subcategory: "Indian Sweets",
    isVeg: true,
    isBestseller: false,
    rating: 4.6,
    variants: [
      { name: "2 pcs", price: 120 },
      { name: "4 pcs", price: 220 },
    ],
    addOns: [{ name: "Extra Syrup", price: 20 }],
  },
  {
    id: 12,
    name: "Chocolate Brownie",
    description:
      "Warm fudgy brownie served with a scoop of vanilla ice cream and chocolate sauce.",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
    category: "Desserts",
    subcategory: "Ice Cream & Cakes",
    isVeg: true,
    isBestseller: true,
    rating: 4.7,
    addOns: [
      { name: "Extra Ice Cream", price: 60 },
      { name: "Chocolate Sauce", price: 30 },
    ],
  },
  {
    id: 13,
    name: "Rasmalai",
    description:
      "Soft paneer patties soaked in saffron-infused milk, garnished with pistachios.",
    price: 140,
    image:
      "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800",
    category: "Desserts",
    subcategory: "Indian Sweets",
    isVeg: true,
    isBestseller: false,
    rating: 4.8,
    variants: [
      { name: "2 pcs", price: 140 },
      { name: "4 pcs", price: 260 },
    ],
  },
  {
    id: 14,
    name: "Masala Chai",
    description:
      "Authentic Indian spiced tea brewed with ginger, cardamom, and fresh milk.",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800",
    category: "Beverages",
    subcategory: "Hot Drinks",
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
  },
  {
    id: 15,
    name: "Fresh Lime Soda",
    description:
      "Refreshing lime soda with a hint of mint. Choose sweet or salted.",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
    category: "Beverages",
    subcategory: "Cold Drinks",
    isVeg: true,
    isBestseller: true,
    rating: 4.6,
  },
  {
    id: 16,
    name: "Mango Lassi",
    description:
      "Thick and creamy yogurt drink blended with fresh Alphonso mangoes.",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800",
    category: "Beverages",
    subcategory: "Shakes & Lassi",
    isVeg: true,
    isBestseller: false,
    rating: 4.7,
    variants: [
      { name: "Regular", price: 120 },
      { name: "Large", price: 180 },
    ],
  },
];

// 👇 NAYA: Initial Categories (Store ke liye)
export const initialCategories: Category[] = [
  {
    id: "cat_1",
    name: "Starters",
    isActive: true,
    order: 1,
    subcategories: ["Veg Starters", "Non-Veg Starters", "Tandoori"],
  },
  {
    id: "cat_2",
    name: "Main Course",
    isActive: true,
    order: 2,
    subcategories: ["Veg Curries", "Non-Veg Curries", "Rice Bowls"],
  },
  {
    id: "cat_3",
    name: "Biryani",
    isActive: true,
    order: 3,
    subcategories: ["Veg", "Chicken", "Mutton"],
  },
  {
    id: "cat_4",
    name: "Breads",
    isActive: true,
    order: 4,
    subcategories: ["Naan", "Roti", "Paratha"],
  },
  {
    id: "cat_5",
    name: "Desserts",
    isActive: true,
    order: 5,
    subcategories: ["Indian Sweets", "Ice Cream & Cakes"],
  },
  {
    id: "cat_6",
    name: "Beverages",
    isActive: true,
    order: 6,
    subcategories: ["Hot Drinks", "Cold Drinks", "Shakes & Lassi"],
  },
];

export const getItemById = (id: number) =>
  menuItems.find((item) => item.id === id);

export const categories = initialCategories.map(c => c.name);