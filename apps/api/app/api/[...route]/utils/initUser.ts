import { supabase } from "./supabase";

export const initUser = async (provider: string, userId: string) => {
  const { data, error } = await supabase
    .from("temp_player")
    .select("*")
    .ilike("userId", userId)
    .eq("provider", provider);
  if (error) {
    console.error(error);
  }
  if (data && data?.length > 0) {
    return data[0];
  } else {
    const { data, error } = await supabase
      .from("temp_player")
      .insert([{ userId, provider, balance: 100 }])
      .select();
    if (error) {
      console.error(error);
    }
    if (data && data?.length > 0) {
      return data[0];
    } else {
      console.error("Failed to initialize user");
    }
  }
};
