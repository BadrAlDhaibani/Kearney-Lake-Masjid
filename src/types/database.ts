/**
 * TypeScript types for Supabase database tables.
 * These types match the schema defined in CLAUDE.md.
 */

export interface PrayerTime {
  id: string;
  prayer_name: string;
  adhan_time: string | null;
  iqama_time: string;
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
  published_at: string;
  created_at: string;
  created_by: string | null;
}

// Insert types (fields that can be omitted on insert)
export type PrayerTimeInsert = Omit<PrayerTime, 'id' | 'updated_at'> & {
  id?: string;
  updated_at?: string;
};

export type AnnouncementInsert = Omit<Announcement, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// Update types (all fields optional except id)
export type PrayerTimeUpdate = Partial<Omit<PrayerTime, 'id'>>;
export type AnnouncementUpdate = Partial<Omit<Announcement, 'id' | 'created_at'>>;

// Supabase Database type definition
export interface Database {
  public: {
    Tables: {
      prayer_times: {
        Row: PrayerTime;
        Insert: PrayerTimeInsert;
        Update: PrayerTimeUpdate;
      };
      announcements: {
        Row: Announcement;
        Insert: AnnouncementInsert;
        Update: AnnouncementUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
