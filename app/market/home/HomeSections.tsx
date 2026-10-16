/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  Dice5,
  Eye,
  LogIn,
  PackageOpen,
  Search,
  Sparkles,
  Trophy,
  UserPlus,
} from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { itemTypeOf } from "../catalog";
import { useMarket } from "../MarketContext";
import { PackGrid } from "./PackGrid";

export function PackListing() {
  const { packs } = useMarket();

  return (
    <section className="case-layout" id="cajas" aria-label="Cajas disponibles">
      <div className="case-header">
        <div>
          <span className="eyebrow">Coleccion actual</span>
          <h2>Elige tu proxima caja</h2>
        </div>
        <p className="case-intro">
          Revisa los posibles premios antes de entrar a la apertura.
        </p>
      </div>

      <PackGrid packList={packs} />
    </section>
  );
}

export function HomeGuideSection() {
  return (
    <section
      className="home-guide-band"
      id="como-funciona"
      aria-label="Como funciona Pullario"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Como funciona</span>
          <h2>De la caja a tu inventario</h2>
        </div>
        <p>
          Una apertura simple, con los premios y sus probabilidades disponibles
          antes de elegir.
        </p>
      </div>

      <ol className="home-steps">
        <li>
          <span>01</span>
          <div>
            <h3>Elegi una caja</h3>
            <p>Explora el contenido, los precios y las probabilidades.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Abrila en la ruleta</h3>
            <p>El resultado se revela al terminar la animacion.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Decidi que hacer</h3>
            <p>Conserva el premio, vendelo por saldo o pedi el retiro.</p>
          </div>
        </li>
      </ol>

      <div className="home-shortcuts">
        <div>
          <span className="eyebrow">Tambien en Pullario</span>
          <h3>Explora cartas e inventario sin perder el foco.</h3>
        </div>
        <nav aria-label="Accesos de Pullario">
          <Link href="/cards">
            <Search size={18} aria-hidden />
            Buscar cartas
          </Link>
          <Link href="/profile">
            <Trophy size={18} aria-hidden />
            Ver inventario
          </Link>
        </nav>
      </div>
    </section>
  );
}

export function HomeView() {
  const {
    heroShowcaseItems,
    session,
    setAuthMode,
    setHomeAuthOpen,
  } = useMarket();

  return (
    <>
      <section className="market-hero" aria-labelledby="main-title">
        <div className="hero-product-stage" aria-hidden>
          {heroShowcaseItems.map((item, index) => (
            <img
              className={`hero-product hero-product-${index + 1}`}
              key={`hero-${item.slotId}`}
              src={cardImage(item.card)}
              alt=""
              onError={handleImageError(item.card.game, itemTypeOf(item.card))}
            />
          ))}
        </div>
        <div className="hero-copy">
          <div className="status-pill">
            <Sparkles size={16} aria-hidden />
            One Piece · Pokemon · Magic
          </div>
          <h1 id="main-title">Cajas TCG para coleccionistas</h1>
          <p>
            Premios reales, probabilidades visibles y una apertura que
            termina en tu inventario.
          </p>
          <div className="hero-actions" aria-label="Acciones principales">
            <Link className="primary-action" href="#cajas">
              <PackageOpen size={18} aria-hidden />
              Ver cajas
            </Link>
            <Link className="secondary-action" href="/cards">
              <Search size={18} aria-hidden />
              Buscar cartas
            </Link>
          </div>
        </div>
      </section>

      {!session && (
        <section className="home-access-band" aria-label="Acceso a Pullario">
          <div>
            <span className="eyebrow">Tu cuenta</span>
            <h2>Entra para abrir, guardar y retirar premios.</h2>
          </div>
          <div className="home-access-actions">
            <button
              className="secondary-action compact"
              onClick={() => {
                setAuthMode("login");
                setHomeAuthOpen(true);
              }}
              type="button"
            >
              <LogIn size={17} aria-hidden />
              Entrar
            </button>
            <button
              className="primary-action compact"
              onClick={() => {
                setAuthMode("register");
                setHomeAuthOpen(true);
              }}
              type="button"
            >
              <UserPlus size={17} aria-hidden />
              Crear cuenta
            </button>
          </div>
        </section>
      )}

      <PackListing />
      <HomeGuideSection />

      <section
        className="trust-band"
        id="confianza"
        aria-label="Controles de confianza"
      >
        <article>
          <Eye size={22} aria-hidden />
          <h3>Todo visible</h3>
          <p>
            Revisa los premios y sus probabilidades antes de abrir.
          </p>
        </article>
        <article>
          <Dice5 size={22} aria-hidden />
          <h3>Resultado claro</h3>
          <p>
            La ruleta termina sobre el mismo premio que recibes.
          </p>
        </article>
        <article>
          <Trophy size={22} aria-hidden />
          <h3>Tu premio, tu decision</h3>
          <p>
            Guardalo, vendelo por saldo o solicita el retiro fisico.
          </p>
        </article>
      </section>
    </>
  );
}
