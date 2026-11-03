// One-off: rasterize public/icon.svg into the PNG sizes the PWA manifest needs.
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const pub = resolve(here, '..', 'public')
const svg = readFileSync(resolve(pub, 'icon.svg'))

const sizes = [192, 512]
for (const size of sizes) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(resolve(pub, `icon-${size}.png`))
  console.log(`wrote icon-${size}.png`)
}
