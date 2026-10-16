import { useEffect, useState } from "react";
import {
  apiFetch,
  authHeader,
  clearLegacyStoredSession,
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
} from "../api";
import type { CatalogState } from "../home/useCatalog";
import type { NoticeState } from "../layout/useNotice";
import type { ProfileFormState } from "../profile/useProfileForm";
import type { ApiStatus, LoginResponse, SessionAuth } from "../types";

type AuthDeps =
  Pick<CatalogState, "loadDbPacks" | "setApiStatus"> &
  Pick<NoticeState, "setWonCardsMessage" | "setWonCardsMessageTone"> &
  Pick<
    ProfileFormState,
    | "fillProfileForm"
    | "profileAddressReference"
    | "profileApartment"
    | "profileCity"
    | "profileCountry"
    | "profileDisplayName"
    | "profileEmail"
    | "profileFloor"
    | "profileFullName"
    | "profilePassword"
    | "profilePhone"
    | "profilePostalCode"
    | "profileProvince"
    | "profileStreet"
    | "profileStreetNumber"
    | "setProfileMessage"
    | "setProfilePassword"
    | "setProfileSaving"
  >;

export function useAuth(deps: AuthDeps) {
  const {
    fillProfileForm,
    loadDbPacks,
    profileAddressReference,
    profileApartment,
    profileCity,
    profileCountry,
    profileDisplayName,
    profileEmail,
    profileFloor,
    profileFullName,
    profilePassword,
    profilePhone,
    profilePostalCode,
    profileProvince,
    profileStreet,
    profileStreetNumber,
    setApiStatus,
    setProfileMessage,
    setProfilePassword,
    setProfileSaving,
    setWonCardsMessage,
    setWonCardsMessageTone,
  } = deps;

  const [session, setSession] = useState<SessionAuth | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [homeAuthOpen, setHomeAuthOpen] = useState(false);

  useEffect(() => {
    const storedSession = readStoredSession();

    if (!storedSession) {
      return;
    }

    saveStoredSession(storedSession);
    clearLegacyStoredSession();
    // The session lives in localStorage, so it can only be restored after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(storedSession);
    fillProfileForm(storedSession);

    void apiFetch("/api/me", {
      headers: { ...authHeader(storedSession) },
    })
      .then(async (response) => {
        const payload = (await response.json()) as LoginResponse;

        if (!response.ok || !payload.user) {
          if (response.status === 401) {
            setSession(null);
            clearStoredSession();
          }
          return;
        }

        const refreshedSession: SessionAuth = {
          ...storedSession,
          ...payload.user,
          token: storedSession.token,
        };
        setSession(refreshedSession);
        saveStoredSession(refreshedSession);
        fillProfileForm(refreshedSession);
      })
      .catch(() => undefined);
  }, [fillProfileForm]);

  const storeSession = (nextSession: SessionAuth) => {
    setSession(nextSession);
    saveStoredSession(nextSession);
    fillProfileForm(nextSession);
  };

  const updateSessionUser = (user?: LoginResponse["user"]) => {
    if (!session || !user) {
      return;
    }

    storeSession({
      ...session,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      street: user.street,
      streetNumber: user.streetNumber,
      floor: user.floor,
      apartment: user.apartment,
      addressReference: user.addressReference,
      city: user.city,
      province: user.province,
      postalCode: user.postalCode,
      country: user.country,
      hasShippingAddress: user.hasShippingAddress,
      shippingAddressMissing: user.shippingAddressMissing,
      balanceUsd: user.balanceUsd,
    });
  };

  const submitAuth = async () => {
    setAuthMessage("");
    setApiStatus("checking");
    let nextApiStatus: ApiStatus = "offline";

    try {
      const response = await apiFetch(
        authMode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loginUsername,
            password: loginPassword,
            email: loginEmail,
          }),
        },
      );
      const payload = (await response.json()) as LoginResponse;
      nextApiStatus = response.status >= 500 ? "offline" : "online";

      if (!response.ok || payload.error || !payload.token || !payload.user) {
        throw new Error(payload.error ?? "No se pudo iniciar sesion.");
      }

      const auth: SessionAuth = {
        token: payload.token,
        ...payload.user,
      };

      storeSession(auth);
      setHomeAuthOpen(false);
      setLoginPassword("");
      setApiStatus("online");
      setAuthMessage(
        payload.user.role === "admin"
          ? "Sesion admin iniciada."
          : "Sesion iniciada.",
      );
      await loadDbPacks();
    } catch (error) {
      setApiStatus(nextApiStatus);
      setAuthMessage(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor local.",
      );
    }
  };

  const updateProfile = async () => {
    if (!session) {
      setProfileMessage("Inicia sesion para editar tu perfil.");
      return;
    }

    setProfileSaving(true);
    setProfileMessage("");

    try {
      const response = await apiFetch("/api/me", {
        method: "PUT",
        headers: {
          ...authHeader(session),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: profileDisplayName,
          email: profileEmail,
          fullName: profileFullName,
          phone: profilePhone,
          street: profileStreet,
          streetNumber: profileStreetNumber,
          floor: profileFloor,
          apartment: profileApartment,
          addressReference: profileAddressReference,
          city: profileCity,
          province: profileProvince,
          postalCode: profilePostalCode,
          country: profileCountry.trim() || "Argentina",
          password: profilePassword,
        }),
      });
      const payload = (await response.json()) as LoginResponse;

      if (!response.ok || payload.error || !payload.user) {
        throw new Error(payload.error ?? "No se pudo actualizar el perfil.");
      }

      const nextSession: SessionAuth = {
        ...session,
        username: payload.user.username,
        role: payload.user.role,
        displayName: payload.user.displayName,
        email: payload.user.email,
        fullName: payload.user.fullName,
        phone: payload.user.phone,
        addressLine1: payload.user.addressLine1,
        addressLine2: payload.user.addressLine2,
        street: payload.user.street,
        streetNumber: payload.user.streetNumber,
        floor: payload.user.floor,
        apartment: payload.user.apartment,
        addressReference: payload.user.addressReference,
        city: payload.user.city,
        province: payload.user.province,
        postalCode: payload.user.postalCode,
        country: payload.user.country,
        hasShippingAddress: payload.user.hasShippingAddress,
        shippingAddressMissing: payload.user.shippingAddressMissing,
        balanceUsd: payload.user.balanceUsd,
      };

      storeSession(nextSession);
      setProfilePassword("");
      setWonCardsMessageTone("success");
      setWonCardsMessage("Perfil actualizado.");
    } catch (error) {
      setProfileMessage(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  return {
    session,
    setSession,
    authMode,
    setAuthMode,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginEmail,
    setLoginEmail,
    authMessage,
    setAuthMessage,
    homeAuthOpen,
    setHomeAuthOpen,
    storeSession,
    updateSessionUser,
    submitAuth,
    updateProfile,
  };
}

export type AuthState = ReturnType<typeof useAuth>;
