import { AwardIcon, ShieldIcon, TruckIcon } from "./icons";

export type TrustLabels = {
  secure: string;
  secureText: string;
  shipping: string;
  shippingText: string;
  quality: string;
  qualityText: string;
};

/** Sellos de confianza (pago, envío, calidad) para ficha y carrito. */
export default function TrustBadges({ labels, compact }: { labels: TrustLabels; compact?: boolean }) {
  const items = [
    { Icon: ShieldIcon, title: labels.secure, text: labels.secureText },
    { Icon: TruckIcon, title: labels.shipping, text: labels.shippingText },
    { Icon: AwardIcon, title: labels.quality, text: labels.qualityText },
  ];
  return (
    <ul className={`grid gap-3 ${compact ? "" : "sm:grid-cols-3"}`}>
      {items.map(({ Icon, title, text }) => (
        <li key={title} className={`flex gap-3 ${compact ? "items-start" : "items-start sm:flex-col sm:items-center sm:text-center"}`}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-product-bg text-link-blue">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="font-manrope text-sm font-bold leading-5 text-heading-dark">{title}</p>
            <p className="text-xs leading-[18px] text-secondary">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
