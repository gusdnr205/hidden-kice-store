import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "히든카이스 | 모두가 푸는 건 이유가 있습니다",
  description:
    "평가원의 시선으로 완성하는 수능. 히든카이스 실전 모의고사와 학습 교재를 만나보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
