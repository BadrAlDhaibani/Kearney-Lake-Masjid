/**
 * TypeScript types for Supabase database tables.
 * These types match the schema defined in CLAUDE.md.
 */

export interface PrayerTime {
  id: string;
  prayer_name: string;
  adhan_time: string | null; // Format: "HH:MM:SS" or null
  iqama_time: string; // Format: "HH:MM:SS"
  is_active: boolean;
  display_order: number;
  notes: string | null;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string; // ISO 8601 timestamp
  created_at: string;
  created_by: string | null;
}

export interface Database {
  public: {
    Tables: {
      prayer_times: {
        Row: PrayerTime;
        Insert: Omit<PrayerTime, 'id' | 'updated_at'>;
        Update: Partial<Omit<PrayerTime, 'id'>>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id' | 'created_at'>;
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>;
      };
    };
  };
}
