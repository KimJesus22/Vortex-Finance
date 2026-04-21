import { insforge } from "@/lib/insforge";

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "ingreso" | "gasto";
  category: string;
  created_at: string;
  is_recurring?: boolean;
  frequency?: string | null;
};

export const TransactionService = {
  async fetchTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await insforge.database
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_recurring", false)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data as Transaction[];
  },

  async createTransaction(tx: Omit<Transaction, "id" | "created_at">): Promise<void> {
    const { error } = await insforge.database.from("transactions").insert(tx);
    if (error) throw error;
  },

  async updateTransaction(id: string, userId: string, updates: Partial<Transaction>): Promise<void> {
    const { error } = await insforge.database
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async deleteTransaction(id: string, userId: string): Promise<void> {
    const { error } = await insforge.database
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }
};
