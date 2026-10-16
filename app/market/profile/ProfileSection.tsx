import Link from "next/link";
import {
  Boxes,
  CircleCheck,
  Info,
  LogIn,
  Save,
  TriangleAlert,
  User,
} from "../../MaterialIcons";
import { argentinaProvinces, roleLabels } from "../catalog";
import { formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import { InventoryPanel } from "./InventoryPanel";

export function ProfileSection() {
  const {
    profileAddressReference,
    profileApartment,
    profileCity,
    profileCountry,
    profileDisplayName,
    profileEmail,
    profileFloor,
    profileFullName,
    profileMessage,
    profilePassword,
    profilePhone,
    profilePostalCode,
    profileProvince,
    profileSaving,
    profileSectionView,
    profileStreet,
    profileStreetNumber,
    session,
    setProfileAddressReference,
    setProfileApartment,
    setProfileCity,
    setProfileCountry,
    setProfileDisplayName,
    setProfileEmail,
    setProfileFloor,
    setProfileFullName,
    setProfilePassword,
    setProfilePhone,
    setProfilePostalCode,
    setProfileProvince,
    setProfileSectionView,
    setProfileStreet,
    setProfileStreetNumber,
    updateProfile,
  } = useMarket();

  return (
    <section className="admin-band page-section" aria-label="Perfil de usuario">
      <div className="admin-intro">
        <span className="eyebrow">Perfil</span>
        <h1>Cuenta local</h1>
        <p>Modifica los datos del usuario que esta usando Pullario en esta PC.</p>
      </div>

      {session ? (
        <>
          <nav className="profile-section-nav" aria-label="Secciones del perfil">
            <button
              className={profileSectionView === "personal" ? "active" : ""}
              onClick={() => setProfileSectionView("personal")}
              type="button"
            >
              <User size={17} aria-hidden />
              Datos personales
            </button>
            <button
              className={profileSectionView === "inventory" ? "active" : ""}
              onClick={() => setProfileSectionView("inventory")}
              type="button"
            >
              <Boxes size={17} aria-hidden />
              Inventario
            </button>
          </nav>

          {profileSectionView === "personal" ? (
            <div className="profile-personal-layout">
              <aside className="profile-account-summary">
                <span className="db-status online">
                  <User size={16} aria-hidden />
                  {roleLabels[session.role]}
                </span>
                <strong>{session.username}</strong>
                <small>
                  Balance demo {formatUsd.format(session.balanceUsd ?? 0)}
                </small>
                <div
                  className={`address-status ${
                    session.hasShippingAddress ? "complete" : "incomplete"
                  }`}
                >
                  {session.hasShippingAddress ? (
                    <CircleCheck size={18} aria-hidden />
                  ) : (
                    <TriangleAlert size={18} aria-hidden />
                  )}
                  <span>
                    <strong>
                      {session.hasShippingAddress
                        ? "Domicilio completo"
                        : "Falta completar el domicilio"}
                    </strong>
                    <small>
                      {session.hasShippingAddress
                        ? "Ya podes solicitar retiros fisicos."
                        : `Falta: ${(
                            session.shippingAddressMissing ?? ["datos obligatorios"]
                          ).join(", ")}.`}
                    </small>
                  </span>
                </div>
              </aside>

              <form
                className="profile-details-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void updateProfile();
                }}
              >
                <section className="profile-form-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Cuenta y contacto</span>
                    <h2>Informacion personal</h2>
                  </div>
                  <div className="profile-form-grid">
                    <label>
                      Nombre visible
                      <input
                        onChange={(event) =>
                          setProfileDisplayName(event.target.value)
                        }
                        value={profileDisplayName}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Nombre y apellido
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="name"
                        onChange={(event) => setProfileFullName(event.target.value)}
                        placeholder="Nombre del destinatario"
                        required
                        value={profileFullName}
                      />
                    </label>
                    <label>
                      Email
                      <input
                        autoComplete="email"
                        onChange={(event) => setProfileEmail(event.target.value)}
                        type="email"
                        value={profileEmail}
                      />
                    </label>
                    <label>
                      Telefono
                      <input
                        autoComplete="tel"
                        onChange={(event) => setProfilePhone(event.target.value)}
                        placeholder="Ej: +54 11 5555 5555"
                        type="tel"
                        value={profilePhone}
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-form-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Entrega</span>
                    <h2>Domicilio</h2>
                    <p>Usaremos esta direccion para enviar tus premios retirados.</p>
                    <div className="shipping-country-notice">
                      <Info size={17} aria-hidden />
                      Por el momento realizamos envios unicamente dentro de Argentina.
                    </div>
                  </div>
                  <div className="profile-form-grid address-grid">
                    <label>
                      <span className="field-label">
                        Pais
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <select
                        autoComplete="country-name"
                        onChange={(event) => setProfileCountry(event.target.value)}
                        required
                        value={profileCountry}
                      >
                        <option value="Argentina">Argentina</option>
                        <option disabled value="proximamente">
                          Otros paises proximamente
                        </option>
                      </select>
                    </label>
                    <label>
                      <span className="field-label">
                        Provincia
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <select
                        autoComplete="address-level1"
                        onChange={(event) =>
                          setProfileProvince(event.target.value)
                        }
                        required
                        value={profileProvince}
                      >
                        <option value="">Seleccionar provincia</option>
                        {argentinaProvinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="field-label">
                        Ciudad
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="address-level2"
                        onChange={(event) => setProfileCity(event.target.value)}
                        required
                        value={profileCity}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Calle
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="address-line1"
                        onChange={(event) => setProfileStreet(event.target.value)}
                        placeholder="Ej: Av. Corrientes"
                        required
                        value={profileStreet}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Numero
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        onChange={(event) =>
                          setProfileStreetNumber(event.target.value)
                        }
                        placeholder="Ej: 1234"
                        required
                        value={profileStreetNumber}
                      />
                    </label>
                    <label>
                      Piso
                      <input
                        onChange={(event) => setProfileFloor(event.target.value)}
                        placeholder="Ej: 4"
                        value={profileFloor}
                      />
                    </label>
                    <label>
                      Departamento
                      <input
                        onChange={(event) =>
                          setProfileApartment(event.target.value)
                        }
                        placeholder="Ej: B"
                        value={profileApartment}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Codigo postal
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="postal-code"
                        onChange={(event) =>
                          setProfilePostalCode(event.target.value)
                        }
                        required
                        value={profilePostalCode}
                      />
                    </label>
                    <label className="wide-field">
                      Referencia
                      <input
                        onChange={(event) =>
                          setProfileAddressReference(event.target.value)
                        }
                        placeholder="Ej: Porton negro, timbre 2"
                        value={profileAddressReference}
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-form-section security-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Seguridad</span>
                    <h2>Cambiar contraseña</h2>
                  </div>
                  <label>
                    Nueva contraseña
                    <input
                      autoComplete="new-password"
                      onChange={(event) => setProfilePassword(event.target.value)}
                      placeholder="Dejar vacio para no cambiar"
                      type="password"
                      value={profilePassword}
                    />
                  </label>
                </section>

                <div className="profile-form-actions">
                  {profileMessage && (
                    <p className="admin-message">{profileMessage}</p>
                  )}
                  <button
                    className="primary-action compact"
                    disabled={profileSaving}
                    type="submit"
                  >
                    <Save size={17} aria-hidden />
                    {profileSaving ? "Guardando" : "Guardar datos"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="profile-inventory-view"><InventoryPanel /></div>
          )}
        </>
      ) : (
        <div className="login-panel">
          <span className="eyebrow">Sesion requerida</span>
          <h3>Entrar desde la pagina principal</h3>
          <Link className="primary-action compact" href="/">
            <LogIn size={17} aria-hidden />
            Ir al login
          </Link>
        </div>
      )}
    </section>
  );
}
