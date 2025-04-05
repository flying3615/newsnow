import process from "node:process"
import { join } from "node:path"
// import viteNitro from "vite-plugin-with-nitro" // Remove this import
import { RollopGlob } from "./tools/rollup-glob"
import { projectDir } from "./shared/dir"

const nitroOption = { // Remove the type annotation
  experimental: {
    database: true,
  },
  rollupConfig: {
    plugins: [RollopGlob()],
  },
  sourceMap: false,
  database: {
    default: {
      connector: "better-sqlite3",
    },
  },
  imports: {
    dirs: ["server/utils", "shared"],
  },
  preset: "node-server",
  alias: {
    "@shared": join(projectDir, "shared"),
    "#": join(projectDir, "server"),
  },
}

if (process.env.VERCEL) {
  nitroOption.preset = "vercel-edge"
  // You can use other online database, do it yourself. For more info: https://db0.unjs.io/connectors
  // nitroOption.database = undefined // Remove this line, let Nitro handle default if needed for Vercel
  // nitroOption.vercel = {
  //   config: {
  //     cache: []
  //   },
  // }
} else if (process.env.CF_PAGES) {
  nitroOption.preset = "cloudflare-pages"
  nitroOption.database = {
    default: {
      connector: "cloudflare-d1",
      // Options like bindingName might be top-level now for D1 connector
      bindingName: "NEWSNOW_DB",
    },
  }
} else if (process.env.BUN) {
  nitroOption.preset = "bun"
  nitroOption.database = {
    default: {
      connector: "bun-sqlite",
    },
  }
}

export default nitroOption // Export the config object directly
