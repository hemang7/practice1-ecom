export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  createdAt: string;
};
