import { describe, expect, it } from 'vitest'
import { extractErrorMessage } from '../apiError'

const fastApiEmailError = {
  detail: [
    {
      type: 'value_error',
      loc: ['body', 'email'],
      msg: 'value is not a valid email address: The part after the @-sign is not valid. It is not within a valid top-level domain.',
      input: 'test@test.ru123',
      ctx: { reason: 'The part after the @-sign is not valid. It is not within a valid top-level domain.' },
    },
  ],
}

describe('extractErrorMessage', () => {
  it('returns a plain string detail as is', () => {
    expect(extractErrorMessage('Не удалось выполнить запрос', 400)).toBe('Не удалось выполнить запрос')
  })

  it('translates a FastAPI invalid email error', () => {
    expect(extractErrorMessage(fastApiEmailError.detail, 422)).toBe('Некорректный email')
  })

  it('joins an array of string messages', () => {
    expect(extractErrorMessage(['Первая ошибка', 'Вторая ошибка'], 422)).toBe('Первая ошибка; Вторая ошибка')
  })

  it('reads message fields from array items', () => {
    expect(extractErrorMessage([{ message: 'Ошибка поля' }, { msg: 'Ещё ошибка' }], 422)).toBe(
      'Ошибка поля; Ещё ошибка',
    )
  })

  it('reads a nested string detail from an object', () => {
    expect(extractErrorMessage({ detail: 'Доступ запрещён' }, 403)).toBe('Доступ запрещён')
  })

  it('reads a message field from an object', () => {
    expect(extractErrorMessage({ message: 'Что-то пошло не так' }, 500)).toBe('Что-то пошло не так')
  })

  it('reads field errors from an object map', () => {
    expect(
      extractErrorMessage({ email: ['value is not a valid email address: bad domain'] }, 422),
    ).toBe('Некорректный email')
  })

  it('falls back to the status when detail is empty', () => {
    expect(extractErrorMessage(null, 500)).toBe('Request failed with status 500')
    expect(extractErrorMessage(undefined, 502)).toBe('Request failed with status 502')
    expect(extractErrorMessage({}, 503)).toBe('Request failed with status 503')
  })

  it('never stringifies objects to [object Object]', () => {
    const message = extractErrorMessage({ nested: { value: 1 } }, 400)

    expect(message).not.toContain('[object Object]')
    expect(message).toBe('Request failed with status 400')
  })
})
