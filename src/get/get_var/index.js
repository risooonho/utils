const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(__dirname)

const decoderList = files.reduce((decoders, filename) => {
  const filePath = path.join(__dirname, filename)
  const extname = path.extname(filePath)

  if (fs.statSync(filePath).isFile() &&
    /^\.js$/i.test(extname) &&
    __filename !== filePath) {
    const decoder = require(filePath)

    decoders[decoder.type] = decoder.decode
  }

  return decoders
}, {})

function decode (buffer, offset = 0) {
  const type = buffer.readInt16LE(offset)
  const flag = buffer.readInt16LE(offset + 2)
  const data = buffer.slice(offset + 4)

  if (decoderList[type] == null) {
    throw new Error(`Decode buffer error: Invalid type ${type}`)
  }

  return decoderList[type](decode, data, flag)
}

/**
 * Decode Variant
 * @param buf {Buffer}
 * @returns {{value: *, length: Number}}
 */
function getVar (buf) {
  const data = decode(buf)
  return { value: data.value, length: data.length + 4 } // +4 cause we don't export type length
}

module.exports = getVar
