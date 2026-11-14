export type Product = {
  id: number;
  title: string;
  category: "단권" | "패스";
  price: number;
  original_price: number | null;
  cover: "single" | "bundle";
  subject: string;
  description: string;
};

const covers: Product["cover"][] = [
  "single",
  "bundle",
  "bundle",
  "single",
  "single",
  "bundle",
  "single",
  "bundle",
  "single",
  "bundle",
  "bundle",
  "single",
];
export const demoProducts: Product[] = Array.from({ length: 36 }, (_, i) => {
  const isSingle = [0, 6, 8].includes(i % 12);
  return {
    id: i + 1,
    title: `2026 Hidden Kice 시즌${Math.floor(i / 12) + 1}`,
    category: isSingle ? "단권" : "패스",
    price: isSingle ? 40000 : 64800,
    original_price: isSingle ? null : 68000,
    cover: covers[i % 12],
    subject: ["국어", "수학", "영어"][Math.floor(i / 4) % 3],
    description:
      "평가원의 출제 원리를 깊이 있게 분석한 실전 모의고사. 낯선 문제 앞에서도 흔들리지 않는 실력을 완성하세요.",
  };
});

export const formatPrice = (value: number) =>
  `${value.toLocaleString("ko-KR")}원`;
