import { Split } from './split.js';

export type HasParam<T> = T extends `:${infer P}` ? P : never;
export type PickByParam<T extends unknown[]> = T extends [infer F, ...infer L]
  ? [HasParam<F>, ...PickByParam<L>]
  : [HasParam<T>];

export type GetParams<
  S extends string,
  T = string | number,
  K extends string = PickByParam<Split<S, '/'>>[number]
> = {
  [Key in K]: T;
};
