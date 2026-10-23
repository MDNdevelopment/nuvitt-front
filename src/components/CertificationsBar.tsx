import { CheckCircleIcon } from "./icons";

export default function CertificationsBar({ items }: { items: string[] }) {
  return (
    <section className="bg-primary-mid text-white">
      <ul className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-center gap-x-[60px] gap-y-2 px-6 py-[22px] font-manrope text-base font-semibold max-md:justify-start max-md:gap-x-6 max-md:py-5">
        {items.map((label) => (
          <li key={label} className="flex items-center gap-2.5">
            <CheckCircleIcon className="size-4 shrink-0" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
