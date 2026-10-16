import { useCallback, useState } from "react";
import type { SessionAuth } from "../types";

export function useProfileForm() {

  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileFullName, setProfileFullName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileStreet, setProfileStreet] = useState("");
  const [profileStreetNumber, setProfileStreetNumber] = useState("");
  const [profileFloor, setProfileFloor] = useState("");
  const [profileApartment, setProfileApartment] = useState("");
  const [profileAddressReference, setProfileAddressReference] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileProvince, setProfileProvince] = useState("");
  const [profilePostalCode, setProfilePostalCode] = useState("");
  const [profileCountry, setProfileCountry] = useState("Argentina");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const fillProfileForm = useCallback((source: SessionAuth) => {
    setProfileDisplayName(source.displayName ?? "");
    setProfileEmail(source.email ?? "");
    setProfileFullName(source.fullName ?? "");
    setProfilePhone(source.phone ?? "");
    setProfileStreet(source.street ?? source.addressLine1 ?? "");
    setProfileStreetNumber(source.streetNumber ?? "");
    setProfileFloor(source.floor ?? "");
    setProfileApartment(source.apartment ?? "");
    setProfileAddressReference(
      source.addressReference ?? source.addressLine2 ?? "",
    );
    setProfileCity(source.city ?? "");
    setProfileProvince(source.province ?? "");
    setProfilePostalCode(source.postalCode ?? "");
    setProfileCountry(source.country?.trim() || "Argentina");
  }, []);

  const clearProfileForm = () => {
    setProfileDisplayName("");
    setProfileEmail("");
    setProfileFullName("");
    setProfilePhone("");
    setProfileStreet("");
    setProfileStreetNumber("");
    setProfileFloor("");
    setProfileApartment("");
    setProfileAddressReference("");
    setProfileCity("");
    setProfileProvince("");
    setProfilePostalCode("");
    setProfileCountry("Argentina");
    setProfilePassword("");
  };

  const [profileSectionView, setProfileSectionView] = useState<
    "personal" | "inventory"
  >("personal");

  return {
    profileDisplayName,
    setProfileDisplayName,
    profileEmail,
    setProfileEmail,
    profileFullName,
    setProfileFullName,
    profilePhone,
    setProfilePhone,
    profileStreet,
    setProfileStreet,
    profileStreetNumber,
    setProfileStreetNumber,
    profileFloor,
    setProfileFloor,
    profileApartment,
    setProfileApartment,
    profileAddressReference,
    setProfileAddressReference,
    profileCity,
    setProfileCity,
    profileProvince,
    setProfileProvince,
    profilePostalCode,
    setProfilePostalCode,
    profileCountry,
    setProfileCountry,
    profilePassword,
    setProfilePassword,
    profileMessage,
    setProfileMessage,
    profileSaving,
    setProfileSaving,
    fillProfileForm,
    clearProfileForm,
    profileSectionView,
    setProfileSectionView,
  };
}

export type ProfileFormState = ReturnType<typeof useProfileForm>;
