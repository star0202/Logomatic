import { differenceWith, isEqual } from 'lodash'
import { inspect } from 'util'

export const diff = (
  after: object,
  before: object
): { original: object; updated: object } => {
  const diff = { original: {}, updated: {} }

  differenceWith(
    Object.entries(after),
    Object.entries(before),
    isEqual
  ).forEach(([k, v]) => {
    Object.defineProperty(diff.original, k, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: (before as any)[k],
      enumerable: true,
    })

    Object.defineProperty(diff.updated, k, {
      value: v,
      enumerable: true,
    })
  })

  return diff
}

export const toString = (obj: object): string => {
  return inspect(obj, {
    maxArrayLength: 200,
    depth: 2,
  })
}
