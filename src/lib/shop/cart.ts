"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Catalog } from "./catalog";

export type CartLine = { id: string; slug: string; qty: number };

const KEY = "nv_cart";
const EMPTY = "[]";
const listeners = new Set<() => void>();

function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function parse(raw: string): CartLine[] {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((l) => l && typeof l.id === "string" && typeof l.slug === "string" && Number.isInteger(l.qty) && l.qty > 0)
      .map((l) => ({ id: l.id, slug: l.slug, qty: Math.min(99, l.qty) }));
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* almacenamiento bloqueado: el carrito vive solo en esta página */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Carrito en localStorage, sincronizado entre pestañas; seguro para hidratación. */
export function useCart() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY);
  const lines = useMemo(() => parse(raw), [raw]);
  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  const add = useCallback((line: CartLine, max: number) => {
    const cur = parse(readRaw());
    const found = cur.find((l) => l.id === line.id);
    const qty = Math.min(99, max, (found?.qty ?? 0) + line.qty);
    write(found ? cur.map((l) => (l.id === line.id ? { ...l, qty } : l)) : [...cur, { ...line, qty }]);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    const cur = parse(readRaw());
    write(qty <= 0 ? cur.filter((l) => l.id !== id) : cur.map((l) => (l.id === id ? { ...l, qty: Math.min(99, qty) } : l)));
  }, []);
  const remove = useCallback((id: string) => write(parse(readRaw()).filter((l) => l.id !== id)), []);
  const clear = useCallback(() => write([]), []);

  return { lines, count, add, setQty, remove, clear };
}

// --- catálogo vivo en el cliente (compartido por todos los componentes de la página) ---
let live: { at: number; promise: Promise<Catalog | null> } | null = null;

function loadCatalog(): Promise<Catalog | null> {
  if (!live || Date.now() - live.at > 30_000) {
    live = {
      at: Date.now(),
      promise: fetch("/api/catalog/")
        .then((r) => (r.ok ? (r.json() as Promise<Catalog>) : null))
        .catch(() => null),
    };
  }
  return live.promise;
}

/** Catálogo (precios, stock y tasa) vigente; null mientras carga o si falla. */
export function useLiveCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  useEffect(() => {
    let alive = true;
    loadCatalog().then((c) => alive && setCatalog(c));
    return () => {
      alive = false;
    };
  }, []);
  return catalog;
}

// --- panel lateral del carrito (se abre al agregar un producto) ---
let drawerOpen = false;
const drawerListeners = new Set<() => void>();
const setDrawer = (open: boolean) => {
  drawerOpen = open;
  drawerListeners.forEach((l) => l());
};
const subscribeDrawer = (cb: () => void) => {
  drawerListeners.add(cb);
  return () => void drawerListeners.delete(cb);
};

export const openDrawer = () => setDrawer(true);
export const closeDrawer = () => setDrawer(false);
export const useDrawerOpen = () =>
  useSyncExternalStore(subscribeDrawer, () => drawerOpen, () => false);
