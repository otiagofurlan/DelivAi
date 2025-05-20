
import { User } from "@/context/AuthContext";

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  createdAt: string;
  userId: string;
}

export interface Order {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  status: "new" | "processing" | "completed";
  total: number;
  createdAt: string;
  userId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Sample product images
const productImages = [
  "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop",
];

// Mock categories
export const categories = [
  "Comida", 
  "Bebidas", 
  "Produtos Físicos", 
  "Serviços", 
  "Digital", 
  "Outro"
];

// Generate mock customers
export const generateCustomers = (count: number): Customer[] => {
  const customers: Customer[] = [];
  for (let i = 0; i < count; i++) {
    customers.push({
      id: crypto.randomUUID(),
      name: `Cliente ${i + 1}`,
      email: `cliente${i + 1}@exemplo.com`,
      phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    });
  }
  return customers;
};

// Mock customers
export const mockCustomers = generateCustomers(5);

// Generate mock products for a user
export const generateProducts = (user: User, count: number): Product[] => {
  const products: Product[] = [];
  for (let i = 0; i < count; i++) {
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const imageIndex = Math.floor(Math.random() * productImages.length);
    products.push({
      id: crypto.randomUUID(),
      name: `Produto ${i + 1}`,
      category: categories[categoryIndex],
      description: `Descrição do produto ${i + 1}. Este é um produto de exemplo.`,
      price: Math.floor(Math.random() * 100) + 10,
      image: productImages[imageIndex],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      userId: user.id,
    });
  }
  return products;
};

// Generate mock orders for a user
export const generateOrders = (user: User, products: Product[], count: number): Order[] => {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    // Randomly select 1-3 products for this order
    const orderProducts: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }> = [];
    
    const productCount = Math.floor(Math.random() * 3) + 1;
    const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < productCount && j < shuffledProducts.length; j++) {
      const product = shuffledProducts[j];
      const quantity = Math.floor(Math.random() * 3) + 1;
      orderProducts.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }
    
    const total = orderProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const customerIndex = Math.floor(Math.random() * mockCustomers.length);
    
    const statusOptions: Array<"new" | "processing" | "completed"> = ["new", "processing", "completed"];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    orders.push({
      id: crypto.randomUUID(),
      customer: mockCustomers[customerIndex],
      products: orderProducts,
      status: randomStatus,
      total,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      userId: user.id,
    });
  }
  
  return orders;
};

// Get user's products
export const getUserProducts = (userId: string): Product[] => {
  const products = localStorage.getItem(`products_${userId}`);
  return products ? JSON.parse(products) : [];
};

// Save user's products
export const saveUserProducts = (userId: string, products: Product[]): void => {
  localStorage.setItem(`products_${userId}`, JSON.stringify(products));
};

// Get user's orders
export const getUserOrders = (userId: string): Order[] => {
  const orders = localStorage.getItem(`orders_${userId}`);
  return orders ? JSON.parse(orders) : [];
};

// Save user's orders
export const saveUserOrders = (userId: string, orders: Order[]): void => {
  localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));
};

// Initialize user data
export const initializeUserData = (user: User): void => {
  if (!user.id) return;
  
  // Check if user data already exists
  const existingProducts = localStorage.getItem(`products_${user.id}`);
  const existingOrders = localStorage.getItem(`orders_${user.id}`);
  
  if (!existingProducts) {
    const products = generateProducts(user, 5);
    saveUserProducts(user.id, products);
  }
  
  if (!existingOrders) {
    const products = getUserProducts(user.id);
    const orders = generateOrders(user, products, 3);
    saveUserOrders(user.id, orders);
  }
};
