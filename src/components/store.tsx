"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { BookArt } from "./book-art";
import { getProducts } from "@/services/products";
import { formatPrice, type Product } from "@/lib/products";

type CartItem = { product: Product; quantity: number };
type InfoPanel =
  | "work"
  | "package"
  | "about"
  | "notice"
  | "account"
  | "terms"
  | "privacy"
  | null;
const slides = [
  {
    label: "HIDDEN KICE —",
    title: "히든카이스",
    text: "모두가 푸는 건 이유가 있습니다",
    sub: "상위권이 선택한 문제, 결과로 증명된 실전 모의고사",
    color: "orange",
  },
  {
    label: "2026 REAL SIMULATION —",
    title: "실전의 차이를 만들다",
    text: "평가원의 시선으로, 수능의 본질에 더 가깝게",
    sub: "완성도 높은 문항과 정교한 해설로 채우는 마지막 한 걸음",
    color: "blue",
  },
  {
    label: "YOUR NEXT LEVEL —",
    title: "흔들리지 않는 실력",
    text: "가장 중요한 순간, 가장 확실한 선택",
    sub: "나의 학습에 맞는 교재로 지금부터 준비하세요",
    color: "purple",
  },
  {
    label: "HIDDEN KICE PASS —",
    title: "한 번의 선택, 끝까지",
    text: "시즌 전체를 함께하는 히든카이스 패스",
    sub: "체계적인 학습으로 완성하는 나만의 수능 루틴",
    color: "green",
  },
  {
    label: "START YOUR SEASON —",
    title: "새로운 시즌의 시작",
    text: "오늘의 한 권이 내일의 자신감이 됩니다",
    sub: "2026 히든카이스, 지금 스토어에서 만나보세요",
    color: "orange",
  },
];

function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`dialog ${wide ? "dialog-wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="닫기" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [page, setPage] = useState(1);
  const [slide, setSlide] = useState(0);
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [panel, setPanel] = useState<InfoPanel>(null);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const catalog = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getProducts();
      setProducts(result.products);
      setDemo(result.demo);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "교재 정보를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    try {
      const data: unknown = JSON.parse(
        localStorage.getItem("hidden-kice-cart") || "[]",
      );
      if (Array.isArray(data))
        setCart(
          data.filter(
            (item): item is CartItem =>
              !!item?.product &&
              typeof item.product.id === "number" &&
              typeof item.product.price === "number" &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0,
          ),
        );
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
      setCart([]);
    }
    setCartReady(true);
  }, []);
  useEffect(() => {
    if (cartReady) {
      try {
        localStorage.setItem("hidden-kice-cart", JSON.stringify(cart));
      } catch {
        /* Browsers may disable persistent storage. */
      }
    }
  }, [cart, cartReady]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const filtered = products.filter(
    (p) =>
      (category === "전체" || p.category === category) &&
      `${p.title} ${p.subject}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 12, currentPage * 12);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const active = slides[slide];
  const addToCart = (product: Product) => {
    setCart((items) =>
      items.some((i) => i.product.id === product.id)
        ? items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          )
        : [...items, { product, quantity: 1 }],
    );
    setToast("장바구니에 교재를 담았습니다.");
  };
  const changeQuantity = (id: number, delta: number) =>
    setCart((items) =>
      items.map((i) =>
        i.product.id === id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i,
      ),
    );
  const goPage = (next: number) => {
    setPage(next);
    catalog.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const openPanel = (next: InfoPanel) => {
    setPanel(next);
    setMobileMenu(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand" aria-label="히든카이스 홈">
            HIDDEN KICE<span className="brand-dot">®</span>
          </a>
          <nav
            aria-label="주 메뉴"
            className={mobileMenu ? "nav nav-open" : "nav"}
          >
            <a
              className="nav-active"
              href="#catalog"
              onClick={() => setMobileMenu(false)}
            >
              스토어
            </a>
            <button onClick={() => openPanel("work")}>AI OMR WORK</button>
            <button onClick={() => openPanel("package")}>패키지</button>
            <button onClick={() => openPanel("about")}>히든카이스 소개</button>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button cart-toggle"
              aria-label={`장바구니 ${count}개`}
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart size={20} />
              {count > 0 && <span className="icon-badge">{count}</span>}
            </button>
            <button
              className="icon-button notification"
              aria-label="공지사항"
              onClick={() => openPanel("notice")}
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <button
              className="icon-button"
              aria-label="내 계정"
              onClick={() => openPanel("account")}
            >
              <UserRound size={19} />
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label="메뉴 열기"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className={`hero hero-${active.color}`}
          aria-label="히든카이스 추천 교재"
        >
          <div className="hero-glow" />
          <div className="hero-inner">
            <div className="hero-copy" key={slide}>
              <p className="hero-eyebrow">{active.label}</p>
              <h1>{active.title}</h1>
              <h2>{active.text}</h2>
              <p className="hero-description">{active.sub}</p>
              <div className="hero-benefits">
                <div>
                  <Award />
                  <span>
                    <b>실전 적중</b>
                    <small>평가원 출제 경향 분석</small>
                  </span>
                </div>
                <div>
                  <Headphones />
                  <span>
                    <b>빈틈없는 해설</b>
                    <small>사고의 흐름을 잇는 풀이</small>
                  </span>
                </div>
                <div>
                  <BookOpen />
                  <span>
                    <b>검증된 실력</b>
                    <small>상위권이 선택한 교재</small>
                  </span>
                </div>
              </div>
              <a className="hero-cta" href="#catalog">
                히든카이스 교재 보기 <ArrowRight size={15} />
              </a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="hero-book-back back-third">
                <BookArt hero color="purple" />
              </div>
              <div className="hero-book-back back-second">
                <BookArt hero color="blue" />
              </div>
              <div className="hero-book-front">
                <BookArt hero color={active.color} />
              </div>
              <div className="podium podium-back" />
              <div className="podium podium-front" />
            </div>
          </div>
          <div className="hero-controls">
            <button
              aria-label="이전 배너"
              onClick={() => setSlide((slide + 4) % 5)}
            >
              <ChevronLeft size={14} />
            </button>
            <span>
              <b>{slide + 1}</b>
              <i>/</i>5
            </span>
            <button
              aria-label="다음 배너"
              onClick={() => setSlide((slide + 1) % 5)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        <section
          className="catalog content-width"
          id="catalog"
          ref={catalog}
          aria-label="교재 스토어"
        >
          <div className="catalog-toolbar">
            <div className="catalog-label">
              <span className="section-kicker">THE HIDDEN STANDARD</span>
              <h2>
                교재 스토어<span>{filtered.length}</span>
              </h2>
            </div>
            <div className="catalog-controls">
              <div className="search-field">
                <Search size={15} />
                <input
                  type="search"
                  aria-label="교재 검색"
                  placeholder="교재 검색"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
                {query && (
                  <button
                    aria-label="검색어 지우기"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="category-tabs" aria-label="교재 유형">
                {["전체", "패스", "단권"].map((c) => (
                  <button
                    key={c}
                    aria-pressed={category === c}
                    className={category === c ? "tab-active" : ""}
                    onClick={() => {
                      setCategory(c);
                      setPage(1);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {demo && (
            <p className="demo-note">데모 스토어 · 샘플 교재 정보입니다.</p>
          )}
          {loading ? (
            <div
              className="product-grid"
              aria-label="교재 불러오는 중"
              aria-busy="true"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <div className="skeleton" key={i}>
                  <div />
                  <span />
                  <span />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state" role="alert">
              <BookOpen size={34} />
              <h3>교재를 불러오지 못했어요</h3>
              <p>{error}</p>
              <button className="primary-button" onClick={load}>
                다시 시도
              </button>
            </div>
          ) : visible.length ? (
            <div className="product-grid">
              {visible.map((product, index) => (
                <article className="product-card" key={product.id}>
                  <button
                    className="product-image"
                    onClick={() => setSelected(product)}
                    aria-label={`${product.title} ${product.subject} ${product.category} 상세 보기`}
                  >
                    <div className="product-art">
                      <BookArt variant={product.cover} />
                    </div>
                    <span className="image-detail">
                      자세히 보기 <ArrowRight size={14} />
                    </span>
                    {index === 0 &&
                      currentPage === 1 &&
                      category === "전체" &&
                      !query && <span className="best-tag">BEST</span>}
                  </button>
                  <div className="product-info">
                    <span className="product-category">
                      {product.category}
                      <span>{product.subject}</span>
                    </span>
                    <button
                      className="product-title"
                      onClick={() => setSelected(product)}
                    >
                      {product.title}
                    </button>
                    {product.original_price && (
                      <span className="old-price">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                    <div className="product-price">
                      {product.original_price && (
                        <span className="discount">
                          {Math.round(
                            (1 - product.price / product.original_price) * 100,
                          )}
                          %
                        </span>
                      )}
                      <strong>{formatPrice(product.price)}</strong>
                      <button
                        className="quick-cart"
                        aria-label={`${product.title} ${product.subject} 장바구니 담기`}
                        onClick={() => addToCart(product)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h3>검색 결과가 없습니다</h3>
              <p>다른 교재명이나 과목으로 검색해 주세요.</p>
              <button
                className="text-button"
                onClick={() => {
                  setQuery("");
                  setCategory("전체");
                  setPage(1);
                }}
              >
                전체 교재 보기 <ArrowRight size={15} />
              </button>
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <nav className="pagination" aria-label="상품 페이지">
              <button
                aria-label="이전 페이지"
                disabled={currentPage === 1}
                onClick={() => goPage(currentPage - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  aria-current={currentPage === i + 1 ? "page" : undefined}
                  className={currentPage === i + 1 ? "page-active" : ""}
                  onClick={() => goPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                aria-label="다음 페이지"
                disabled={currentPage === pages}
                onClick={() => goPage(currentPage + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </nav>
          )}
        </section>
      </main>

      <footer className="site-footer content-width">
        <div className="footer-top">
          <a className="footer-brand" href="#">
            HIDDEN KICE
          </a>
          <span>수능의 본질을 향한, 가장 확실한 선택.</span>
        </div>
        <div className="footer-links">
          <button onClick={() => openPanel("about")}>회사소개</button>
          <button onClick={() => openPanel("terms")}>이용약관</button>
          <button onClick={() => openPanel("privacy")}>개인정보처리방침</button>
        </div>
        <p>
          본 사이트는 히든카이스 스토어 화면을 재구성한 포트폴리오 데모입니다.
        </p>
        <p>
          실제 주문 및 결제는 제공되지 않습니다. 교재 표지는 구현을 위한 재구성
          이미지입니다.
        </p>
        <small>Copyright © 2026 HIDDEN KICE. All rights reserved.</small>
      </footer>

      {selected && (
        <Dialog title="교재 상세" onClose={() => setSelected(null)} wide>
          <div className="product-detail">
            <div className="detail-art">
              <BookArt variant={selected.cover} />
            </div>
            <div className="detail-copy">
              <p className="detail-category">
                {selected.subject} · {selected.category}
              </p>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <div className="detail-meta">
                <span>구성</span>
                <b>
                  {selected.category === "패스"
                    ? "시즌 모의고사 + 상세 해설"
                    : "실전 모의고사 1권 + 해설"}
                </b>
                <span>배송</span>
                <b>데모 상품 · 실제 배송 없음</b>
              </div>
              {selected.original_price && (
                <span className="old-price">
                  {formatPrice(selected.original_price)}
                </span>
              )}
              <strong className="detail-price">
                {formatPrice(selected.price)}
              </strong>
              <button
                className="primary-button"
                onClick={() => addToCart(selected)}
              >
                <ShoppingBag size={18} />
                장바구니 담기
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {showCart && (
        <Dialog
          title={`장바구니 (${count})`}
          onClose={() => setShowCart(false)}
        >
          {cart.length ? (
            <>
              <div className="cart-items">
                {cart.map(({ product, quantity }) => (
                  <div className="cart-item" key={product.id}>
                    <div className="cart-art">
                      <BookArt variant={product.cover} />
                    </div>
                    <div className="cart-item-copy">
                      <small>
                        {product.subject} · {product.category}
                      </small>
                      <h3>{product.title}</h3>
                      <strong>{formatPrice(product.price * quantity)}</strong>
                      <div className="quantity">
                        <button
                          aria-label={`${product.id}번 상품 수량 줄이기`}
                          disabled={quantity === 1}
                          onClick={() => changeQuantity(product.id, -1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{quantity}</span>
                        <button
                          aria-label={`${product.id}번 상품 수량 늘리기`}
                          onClick={() => changeQuantity(product.id, 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="icon-button"
                      aria-label={`${product.title} 삭제`}
                      onClick={() =>
                        setCart((items) =>
                          items.filter((i) => i.product.id !== product.id),
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>총 상품 금액</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p className="cart-notice">
                포트폴리오 데모로 실제 결제는 진행되지 않습니다.
              </p>
              <button
                className="primary-button"
                onClick={() => setShowCart(false)}
              >
                계속 둘러보기 <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="empty-state">
              <ShoppingBag size={35} />
              <h3>장바구니가 비어 있습니다</h3>
              <p>나에게 필요한 교재를 담아보세요.</p>
              <button
                className="primary-button"
                onClick={() => setShowCart(false)}
              >
                교재 둘러보기
              </button>
            </div>
          )}
        </Dialog>
      )}

      {panel && (
        <Dialog
          title={
            {
              work: "AI OMR WORK",
              package: "나에게 맞는 교재 패스",
              about: "히든카이스 소개",
              notice: "공지사항",
              account: "내 계정",
              terms: "이용 안내",
              privacy: "개인정보 처리 안내",
            }[panel]
          }
          onClose={() => setPanel(null)}
        >
          <div className="info-panel">
            {panel === "work" ? (
              <>
                <div className="panel-symbol">
                  <SlidersHorizontal />
                </div>
                <h3>풀이 다음의 학습까지</h3>
                <p>
                  AI OMR은 답안 분석과 학습 피드백을 위한 서비스입니다. 현재
                  데모에서는 제공하지 않습니다.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setPanel(null);
                    catalog.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  실전 교재 살펴보기
                </button>
              </>
            ) : panel === "package" ? (
              <>
                <BookOpen className="panel-symbol" />
                <h3>한 시즌을 탄탄하게 완성하세요</h3>
                <p>
                  실전 모의고사와 상세 해설을 한 번에 만날 수 있는 패스 교재를
                  확인하세요.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setCategory("패스");
                    setQuery("");
                    setPage(1);
                    setPanel(null);
                    catalog.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  패스 교재 보기 <ArrowRight size={16} />
                </button>
              </>
            ) : panel === "about" ? (
              <>
                <p className="detail-category">THE HIDDEN STANDARD</p>
                <h3>수능의 본질을 향해.</h3>
                <p>
                  히든카이스는 평가원의 출제 의도와 사고 과정을 담아낸 실전
                  모의고사를 지향합니다.
                </p>
                <p>
                  이 페이지는 제공된 레퍼런스를 바탕으로 구현한 비공식
                  포트폴리오 데모입니다.
                </p>
              </>
            ) : panel === "notice" ? (
              <>
                <p className="notice-date">2026.11.14 · 스토어 안내</p>
                <h3>히든카이스 데모 스토어 오픈</h3>
                <p>
                  교재 검색, 유형별 필터와 장바구니를 이용할 수 있습니다. 샘플
                  교재는 실제 판매 상품이 아닙니다.
                </p>
              </>
            ) : panel === "account" ? (
              <>
                <UserRound className="panel-symbol" />
                <h3>가볍게 둘러보세요</h3>
                <p>
                  데모 스토어는 로그인 없이 이용할 수 있습니다. 장바구니는 현재
                  브라우저에 저장됩니다.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setPanel(null);
                    setShowCart(true);
                  }}
                >
                  내 장바구니 보기
                </button>
              </>
            ) : panel === "terms" ? (
              <>
                <h3>포트폴리오 데모 이용 안내</h3>
                <p>
                  본 사이트는 UI 및 상품 탐색 기능을 시연하기 위한 비공식
                  데모입니다. 회원가입, 주문, 결제 및 배송 계약은 체결되지
                  않습니다.
                </p>
              </>
            ) : (
              <>
                <h3>개인정보 수집 없이 이용합니다</h3>
                <p>
                  이 데모는 이름, 이메일, 결제 정보를 수집하지 않습니다.
                  장바구니 상품 정보는 현재 브라우저의 로컬 저장소에 저장되며,
                  장바구니에서 상품을 삭제하거나 브라우저 사이트 데이터를 지우면
                  삭제됩니다.
                </p>
                <p>
                  Supabase가 연결된 경우 공개된 상품 정보를 읽기 위해 해당
                  서비스에 요청합니다.
                </p>
              </>
            )}
          </div>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            onClick={() => {
              setToast("");
              setSelected(null);
              setShowCart(true);
            }}
          >
            보기 <ArrowRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
