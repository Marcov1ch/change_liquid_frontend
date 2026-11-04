export const RESEND_COOLDOWN_SECONDS = 60

export function buildResendCooldownKey(userId: number, email: string): string {
    return `email-verification-resend:${userId}:${email}`
}

export function readResendCooldown(key: string, now: number = Date.now()): number {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return 0

        const until = Number(raw)
        if (!Number.isFinite(until) || until <= now) {
            localStorage.removeItem(key)
            return 0
        }

        return until
    } catch {
        return 0
    }
}

export function startResendCooldown(
    key: string,
    seconds: number = RESEND_COOLDOWN_SECONDS,
    now: number = Date.now(),
): number {
    const until = now + seconds * 1000
    try {
        localStorage.setItem(key, String(until))
    } catch {
        return until
    }
    return until
}

export function getRemainingSeconds(until: number, now: number = Date.now()): number {
    if (until <= now) return 0
    return Math.ceil((until - now) / 1000)
}
