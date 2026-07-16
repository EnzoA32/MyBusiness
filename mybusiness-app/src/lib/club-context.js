"use client";

import { createContext, useContext } from "react";

export const ClubContext = createContext(null);

export function useClub() {
  const club = useContext(ClubContext);
  if (!club) {
    throw new Error("useClub() must be used within <ClubContext.Provider>");
  }
  return club;
}
