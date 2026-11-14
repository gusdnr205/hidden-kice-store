import { supabase } from "@/lib/supabase";
import { demoProducts, type Product } from "@/lib/products";

export async function getProducts(): Promise<{
  products: Product[];
  demo: boolean;
}> {
  if (!supabase) return { products: demoProducts, demo: true };
  const { data, error } = await supabase
    .from("products")
    .select("id,title,category,price,original_price,cover,subject,description")
    .order("id");
  if (error)
    throw new Error(
      "교재 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  return { products: data as Product[], demo: false };
}
