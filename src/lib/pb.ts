import "server-only";

/** Error de PocketBase con los mensajes por campo ya normalizados. */
export class PBError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export function pbUrl(): string {
  const url = process.env.POCKETBASE_URL;
  if (!url) throw new Error("Falta la variable de entorno POCKETBASE_URL");
  return url.replace(/\/$/, "");
}

type Options = {
  token?: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  query?: Record<string, string | number | undefined>;
  /** IP real del visitante: se reenvía para que el rate limit de PocketBase sea por persona y no por servidor. */
  ip?: string;
  /** Opciones de caché de Next para lecturas públicas (por defecto: sin caché). */
  next?: { revalidate?: number | false; tags?: string[] };
};

/** fetch mínimo contra PocketBase. Sin caché salvo que se pida con `next` (lecturas públicas del catálogo). */
export async function pb<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const url = new URL(pbUrl() + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = opts.token;
  if (opts.ip) headers["X-Forwarded-For"] = opts.ip;
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body,
      ...(opts.next ? { next: opts.next } : { cache: "no-store" as const }),
    });
  } catch {
    throw new PBError("No se pudo conectar con el servidor. Intenta de nuevo.", 503);
  }
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries((data?.data ?? {}) as Record<string, { message?: string }>)) {
      if (v?.message) fields[k] = translate(v.message);
    }
    throw new PBError(translate(data?.message ?? "Error inesperado"), res.status, fields);
  }
  return data as T;
}

const DICT: [RegExp, string][] = [
  [/cannot be blank/i, "Este campo es obligatorio."],
  [/must be unique|value already exists/i, "Ya existe un registro con este valor."],
  [/must be no less than/i, "El valor es menor al mínimo permitido."],
  [/must be no greater than/i, "El valor es mayor al máximo permitido."],
  [/must be in a valid format/i, "El formato no es válido."],
  [/must be a valid email/i, "El correo no es válido."],
  [/failed to authenticate/i, "Correo o clave incorrectos."],
  [/wasn't found|not found/i, "No se encontró el registro."],
  [/not allowed|only superusers|permission|forbidden/i, "No tienes permiso para esta acción."],
  [/file.*too big|must not exceed/i, "El archivo es demasiado grande."],
];

function translate(message: string): string {
  return DICT.find(([re]) => re.test(message))?.[1] ?? message;
}
