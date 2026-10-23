"use client";

import { useEffect, useState } from "react";
import { Checkbox, Field } from "../ui";

type Props = {
  slot: string;
  label: string;
  hint: string;
  /** Imagen actual (URL ya resuelta) o null. */
  current: string | null;
  required?: boolean;
  removable?: boolean;
  error?: string;
  onChange: (hasImage: boolean) => void;
};

/** Ranura de imagen: muestra la actual, permite reemplazarla (y quitarla si es opcional). */
export default function ImageSlot({ slot, label, hint, current, required, removable, error, onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const shown = removed ? null : (preview ?? current);
  return (
    <div className="rounded-lg border border-[#e1e8ee] p-3">
      <Field label={`${label}${required ? " *" : ""}`} htmlFor={`img_${slot}`} error={error} hint={hint}>
        <div className="mb-2 grid h-[170px] place-items-center rounded bg-[#f4f7fa]">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="max-h-[160px] max-w-full object-contain" />
          ) : (
            <span className="text-xs text-slate">Sin imagen</span>
          )}
        </div>
        <input
          id={`img_${slot}`}
          name={`img_${slot}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
            setRemoved(false);
            onChange(!!f || !!current);
          }}
          className="block w-full text-xs text-slate file:mr-3 file:rounded file:border-0 file:bg-product-bg file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-heading-dark"
        />
      </Field>
      {removable && current && (
        <div className="mt-2">
          <Checkbox
            name={`rm_${slot}`}
            label="Quitar esta imagen"
            checked={removed}
            onChange={(e) => {
              setRemoved(e.target.checked);
              if (e.target.checked) setPreview(null);
              onChange(!e.target.checked);
            }}
          />
        </div>
      )}
    </div>
  );
}
