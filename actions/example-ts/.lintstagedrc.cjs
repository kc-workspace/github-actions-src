const { default: defineConfig, Config } = require('@kcws/lintstaged-config')
const { join } = require('node:path')

const yamllint = {
  config: join(process.cwd(), '..', '..', '.github', 'linters', '.yamllint.yml'),
}

module.exports = defineConfig(Config.builder().default({ yamllint }).build())
