export enum Sites {
  netflix = "netflix",
}

export function getCurrentSite(): Sites {
  const host = window.location.host;
  if (host.includes("netflix")) {
    return Sites.netflix;
  }
}
