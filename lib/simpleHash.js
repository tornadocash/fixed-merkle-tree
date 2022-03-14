"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleHash = void 0;
/***
 * This is insecure hash function, just for example only
 * @param data
 * @param seed
 * @param hashLength
 */
function simpleHash(data, seed, hashLength = 40) {
    const str = data.join('');
    let i, l, hval = seed !== null && seed !== void 0 ? seed : 0x811c9dcc5;
    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 6) + (hval << 8) + (hval << 24);
    }
    const hash = (hval >>> 0).toString(16);
    return BigInt('0x' + hash.padEnd(hashLength - (hash.length - 1), '0')).toString(10);
}
exports.simpleHash = simpleHash;
exports.default = (left, right) => simpleHash([left, right]);
