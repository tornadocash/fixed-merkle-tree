import { Element } from './';
/***
 * This is insecure hash function, just for example only
 * @param data
 * @param seed
 * @param hashLength
 */
export declare function simpleHash<T>(data: T[], seed?: number, hashLength?: number): string;
declare const _default: (left: Element, right: Element) => string;
export default _default;
