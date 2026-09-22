 import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export const db = {
  async query(table, options = {}) {
    try {
      let query = supabase.from(table);
      
      if (options.select) query = query.select(options.select);
      if (options.eq) {
        Object.keys(options.eq).forEach(key => {
          query = query.eq(key, options.eq[key]);
        });
      }
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending !== false });
      }
      if (options.limit) query = query.limit(options.limit);
      if (options.single) query = query.single();
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async insert(table, data) {
    try {
      const { data: result, error } = await supabase.from(table).insert(data).select();
      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(table, data, conditions) {
    try {
      let query = supabase.from(table).update(data);
      if (conditions.eq) {
        Object.keys(conditions.eq).forEach(key => {
          query = query.eq(key, conditions.eq[key]);
        });
      }
      const { data: result, error } = await query.select();
      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async delete(table, conditions) {
    try {
      let query = supabase.from(table).delete();
      if (conditions.eq) {
        Object.keys(conditions.eq).forEach(key => {
          query = query.eq(key, conditions.eq[key]);
        });
      }
      const { data: result, error } = await query;
      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async rpc(functionName, params = {}) {
    try {
      const { data, error } = await supabase.rpc(functionName, params);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
