// Core application types for Kairo

export type OrderStatus = 'pending' | 'accepted' | 'printing' | 'ready' | 'completed' | 'cancelled';
export type ColourMode = 'bw' | 'colour';
export type PrintSide = 'separate_pages' | 'both_sides';
export type PageCountSource = 'auto' | 'manual' | 'estimated';

export interface Profile {
  id: string;
  full_name: string;
  kcc_id: string;
  class_name: string;
  year: string;
  section: string;
  room_number: string;
  id_card_photo_path?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface PricingConfig {
  id: number;
  bw_price_per_page: number;
  colour_price_per_page: number;
  updated_at: string;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  student_id: string;
  status: OrderStatus;
  total_amount: number;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  page_count?: number;
  page_count_source: PageCountSource;
  colour_mode: ColourMode;
  print_side?: PrintSide;
  copies: number;
  price_per_page: number;
  item_total: number;
  created_at: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  storagePath?: string;
  pageCount?: number;
  pageCountSource?: PageCountSource;
  pageCountLoading?: boolean;
  pageCountError?: string;
  colourMode: ColourMode;
  printSide: PrintSide;
  copies: number;
}

export interface AdminStats {
  pending_orders: number;
  orders_today: number;
  completed_orders: number;
  total_pages_printed: number;
  bw_pages: number;
  colour_pages: number;
  revenue: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  printing: 'Printing',
  ready: 'Ready for Collection',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  accepted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  printing: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  ready: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  completed: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};
