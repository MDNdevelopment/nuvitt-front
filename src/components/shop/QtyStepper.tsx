"use client";

import { MinusIcon, PlusIcon } from "./icons";

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (n: number) => void;
  labels: { quantity: string; increase: string; decrease: string };
  size?: "md" | "sm";
};

/** Selector de cantidad en pastilla, compartido por ficha, carrito y panel lateral. */
export default function QtyStepper({ value, min = 1, max, onChange, labels, size = "md" }: Props) {
  const btn = size === "sm" ? "size-9" : "size-12";
  return (
    <div role="group" aria-label={labels.quantity} className="inline-flex items-center rounded-full border border-primary-light2 bg-white shadow-sm">
      <button type="button" aria-label={labels.decrease} onClick={() => onChange(value - 1)} disabled={value <= min} className={`${btn} grid place-items-center rounded-full text-link-blue transition-colors hover:bg-product-bg disabled:opacity-40 disabled:hover:bg-transparent`}>
        <MinusIcon className="size-4" />
      </button>
      <span aria-live="polite" className={`text-center font-raleway font-bold text-ink ${size === "sm" ? "min-w-7 text-base" : "min-w-9 text-lg"}`}>
        {Math.min(value, max)}
      </span>
      <button type="button" aria-label={labels.increase} onClick={() => onChange(value + 1)} disabled={value >= max} className={`${btn} grid place-items-center rounded-full text-link-blue transition-colors hover:bg-product-bg disabled:opacity-40 disabled:hover:bg-transparent`}>
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
