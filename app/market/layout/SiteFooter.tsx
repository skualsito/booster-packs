import Link from "next/link";
import { PackageOpen } from "../../MaterialIcons";
import { isSellerRole } from "../catalog";
import { useMarket } from "../MarketContext";

export function SiteFooter() {
  const { loadWonCards, session, setWonCardsOpen } = useMarket();

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="footer-brand" href="/">
          <PackageOpen size={19} aria-hidden />
          Pullario
        </Link>
        <p>
          Prototipo web para abrir cajas TCG con probabilidades visibles,
          buscador de cartas e inventario de usuario.
        </p>
      </div>
      <div className="footer-links">
        <nav aria-label="Navegacion del pie">
          <strong>Explorar</strong>
          <Link href="/">Cajas</Link>
          <Link href="/upgrader">Upgrader</Link>
          <Link href="/changer">Changer</Link>
          <Link href="/cards">Cartas</Link>
          <Link href="#como-funciona">Indice</Link>
          <Link href="#confianza">Confianza</Link>
        </nav>
        <nav aria-label="Cuenta y administracion">
          <strong>Cuenta</strong>
          <Link href="/profile">Perfil</Link>
          <button
            onClick={() => {
              setWonCardsOpen(true);
              void loadWonCards();
            }}
            type="button"
          >
            Premios ganados
          </button>
          {isSellerRole(session?.role) && <Link href="/admin">Administracion</Link>}
        </nav>
      </div>
      <div className="footer-note">
        <strong>Demo local</strong>
        <span>
          Sin pagos reales. Antes de publicar con dinero real hay que revisar
          terminos, edad, impuestos, privacidad y normativa de azar.
        </span>
      </div>
    </footer>
  );
}
