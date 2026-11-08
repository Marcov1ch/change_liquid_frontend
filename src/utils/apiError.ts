const EMAIL_ERROR_PATTERN = /not a valid email address/i

function normalizeMessage(message: string): string {
    const text = message.trim()
    if (!text) return ''
    if (EMAIL_ERROR_PATTERN.test(text)) return 'Некорректный email'
    return text
}

function extractFromValue(value: unknown): string {
    if (typeof value === 'string') return normalizeMessage(value)
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return ''
}

function extractFromItem(item: unknown): string {
    if (typeof item === 'string') return normalizeMessage(item)
    if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        for (const key of ['msg', 'message', 'detail', 'error']) {
            const text = extractFromValue(record[key])
            if (text) return text
        }
    }
    return ''
}

function extractFromList(items: unknown[]): string {
    return items.map(extractFromItem).filter(Boolean).join('; ')
}

function extractFromObject(detail: Record<string, unknown>): string {
    for (const key of ['detail', 'message', 'error', 'msg']) {
        const value = detail[key]
        if (Array.isArray(value)) {
            const text = extractFromList(value)
            if (text) return text
        } else {
            const text = extractFromValue(value)
            if (text) return text
        }
    }

    return Object.values(detail)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map(extractFromItem)
        .filter(Boolean)
        .join('; ')
}

export function extractErrorMessage(detail: unknown, status: number): string {
    if (typeof detail === 'string' && detail.trim()) return normalizeMessage(detail)
    if (Array.isArray(detail)) {
        const text = extractFromList(detail)
        if (text) return text
    } else if (detail && typeof detail === 'object') {
        const text = extractFromObject(detail as Record<string, unknown>)
        if (text) return text
    }
    return `Request failed with status ${status}`
}
