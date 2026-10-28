import { CheckIcon } from "./icons";

/** Indicador de pasos de la compra: Carrito › Datos y envío › Pago. */
export default function CheckoutSteps({ current, labels }: { current: 1 | 2 | 3; labels: { label: string; cart: string; details: string; payment: string } }) {
  const steps = [labels.cart, labels.details, labels.payment];
  return (
    <ol aria-label={labels.label} className="mb-8 flex items-center gap-2 font-manrope text-sm font-semibold sm:gap-3">
      {steps.map((name, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        return (
          <li key={name} aria-current={on ? "step" : undefined} className="flex items-center gap-2 sm:gap-3">
            <span className={`grid size-8 place-items-center rounded-full text-[13px] font-bold ${done ? "bg-accent text-white" : on ? "bg-gradient-to-br from-link-blue to-primary-dark text-white shadow-md" : "bg-[#e6edf3] text-slate"}`}>
              {done ? <CheckIcon className="size-4" /> : n}
            </span>
            <span className={`${on ? "text-heading-dark" : "text-slate"} ${on ? "" : "hidden sm:inline"}`}>{name}</span>
            {n < steps.length && <span aria-hidden="true" className="h-px w-6 bg-primary-light2 sm:w-12" />}
          </li>
        );
      })}
    </ol>
  );
}
