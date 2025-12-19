
export enum OrderStatus {
  NEW = 'NEW',
  WASHING = 'WASHING',
  READY = 'READY',
  DELIVERED = 'DELIVERED'
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string; // e.g., PC-1023
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    telegram?: string;
  };
  details: {
    itemCount: number;
    serviceType: string;
    notes?: string;
    pickupDate?: string;
    dateIn: string;
  };
  payment: {
    total: number;
    advance: number;
    remaining: number;
  };
  status: OrderStatus;
  createdAt: string;
}

export interface AppState {
  orders: Order[];
  isAdmin: boolean;
}
