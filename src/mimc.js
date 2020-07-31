const { mimcsponge } = require('circomlib')
const { bigInt } = require('snarkjs')
module.exports = (left, right) => mimcsponge.multiHash([bigInt(left), bigInt(right)]).toString()
