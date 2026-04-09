export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          username?: string
          display_name?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          creator_id: string
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          creator_id: string
          invite_code: string
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'groups_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      rounds: {
        Row: {
          id: string
          group_id: string
          created_by: string
          theme: string
          start_date: string
          submission_deadline: string
          voting_deadline: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          created_by: string
          theme: string
          start_date: string
          submission_deadline: string
          voting_deadline: string
          created_at?: string
        }
        Update: {
          theme?: string
          start_date?: string
          submission_deadline?: string
          voting_deadline?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rounds_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rounds_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      submissions: {
        Row: {
          id: string
          round_id: string
          user_id: string
          spotify_track_id: string
          track_name: string
          artist_name: string
          album_name: string | null
          album_art_url: string | null
          preview_url: string | null
          spotify_external_url: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          round_id: string
          user_id: string
          spotify_track_id: string
          track_name: string
          artist_name: string
          album_name?: string | null
          album_art_url?: string | null
          preview_url?: string | null
          spotify_external_url?: string | null
          submitted_at?: string
        }
        Update: {
          spotify_track_id?: string
          track_name?: string
          artist_name?: string
          album_name?: string | null
          album_art_url?: string | null
          preview_url?: string | null
          spotify_external_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'submissions_round_id_fkey'
            columns: ['round_id']
            isOneToOne: false
            referencedRelation: 'rounds'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'submissions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      votes: {
        Row: {
          id: string
          round_id: string
          voter_id: string
          submission_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          round_id: string
          voter_id: string
          submission_id: string
          voted_at?: string
        }
        Update: {
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'votes_round_id_fkey'
            columns: ['round_id']
            isOneToOne: false
            referencedRelation: 'rounds'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'votes_voter_id_fkey'
            columns: ['voter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'votes_submission_id_fkey'
            columns: ['submission_id']
            isOneToOne: false
            referencedRelation: 'submissions'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
