export type GConstructor<T = any> = new (...args: any[]) => T;
export type Arrayable<T> = GConstructor<Array<T>>