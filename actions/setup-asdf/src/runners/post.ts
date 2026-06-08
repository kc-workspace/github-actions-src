import type { AppBuilderRunner } from '@kcws/github-actions'
import type builder from '../app'

const runner: AppBuilderRunner<typeof builder> = (data, context) => {
  if (data.input.cacheEnabled) {
    const cacheOption = {
      system: true,
      custom: data.input.cacheKeys,
    }

    context.use('log').info('Uploading cache from {0}', data.input.asdfDirectory)
    context.use('cache').save(cacheOption, data.input.asdfDirectory)
  } else {
    context.use('log').info('Disabled caching via user config')
  }
}

export default runner
