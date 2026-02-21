export interface EventDetails {
  id: number;
  title: string;
  date: string;
  description: string;
  venue: string;
  hero_image: string;
  venue_map?: string;
  host_name?: string;
  host_description?: string;
  host_image?: string;
}

export interface TicketType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
}

export interface Ticket {
  id: string;
  transaction_id: string;
  ticket_type_id: number;
  ticket_type_name: string;
  holder_name: string;
  email: string;
  qr_code: string;
  is_used: boolean;
  used_at: string | null;
  purchase_date: string;
  price: number;
}

export interface Stats {
  totalSold: number;
  totalRevenue: number;
  salesByType: {
    name: string;
    sold: number;
    price: number;
  }[];
}

export interface GalleryItem {
  id: number;
  image_url: string;
  caption: string;
  category: 'guest' | 'performance' | 'sponsor';
}
