export const isString = (target: unknown): target is string =>
  typeof target === 'string'
export const isNumber = (target: unknown): target is number =>
  typeof target === 'number'
export const isNull = (target: unknown): target is null => target === null
export const isNullish = (target: unknown): target is null | undefined => typeof target === 'undefined' || isNull(target)
export const isObject = (target: unknown): target is object =>
  !isNull(target) && typeof target === 'object'

export const isTypedObject = <T extends object>(target: unknown): target is T => isObject(target);

export const isArray = Array.isArray;

export type AnyFn = (...args: any[]) => any

export const isFunction = (target: unknown): target is AnyFn =>
  typeof target === 'function'

export type Primitive = string | number | boolean | null | undefined

export const isPrimitive = (target: unknown): target is Primitive =>
  !isObject(target)
