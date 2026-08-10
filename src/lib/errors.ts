/** Narrowing helpers for axios errors — keeps `any` out of every catch block. */

interface ApiErrorShape {
  response?: { status?: number; data?: { detail?: unknown } }
}

export function errorStatus(err: unknown): number | undefined {
  return (err as ApiErrorShape)?.response?.status
}

export function errorText(err: unknown, fallback: string): string {
  const detail = (err as ApiErrorShape)?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length && typeof (detail[0] as { msg?: unknown })?.msg === 'string') {
    return (detail[0] as { msg: string }).msg
  }
  return fallback
}
