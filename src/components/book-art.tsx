type Props = { variant?: "single" | "bundle"; color?: string; hero?: boolean };

export function BookArt({
  variant = "single",
  color = "green",
  hero = false,
}: Props) {
  if (variant === "bundle")
    return (
      <div className="book-bundle" aria-label="히든카이스 5권 교재 세트">
        {["blue", "green", "pink", "orange", "purple"].map((c, i) => (
          <div className={`mini-book mini-${i} color-${c}`} key={c}>
            <b>
              HIDDEN
              <br />
              KICE
            </b>
            <span className="paper-fold" />
            <small>2026 · SEASON 01</small>
          </div>
        ))}
      </div>
    );
  return (
    <div
      className={`book ${hero ? "hero-book" : ""} color-${color}`}
      aria-label="히든카이스 교재 표지"
    >
      <div className="book-spine">2026 HIDDEN KICE</div>
      <div className="book-face">
        <small className="book-edition">THE REAL STANDARD OF CSAT</small>
        <strong>HIDDEN</strong>
        <div className="book-horizon" />
        <div className="book-label">
          <span>HIDDEN</span>
          <span>KICE</span>
        </div>
        <div className="book-bottom">
          <b>
            2026 <i>✦</i> 2026
          </b>
          <small>실전 모의고사의 새로운 기준</small>
        </div>
      </div>
    </div>
  );
}
