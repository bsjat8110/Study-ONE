import crypto from 'node:crypto'

function makeSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

console.log('Study-ONE secret rotation values')
console.log('')
console.log(`AUTH_SECRET=${makeSecret(32)}`)
console.log(`NEXTAUTH_SECRET=${makeSecret(32)}`)
