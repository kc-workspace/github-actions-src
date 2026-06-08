import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import {
  AppBuilder,
  CacheContextPlugin,
  ContextBuilder,
  EnvContextPlugin,
  ExecContextPlugin,
  InputContextPlugin,
  IOContextPlugin,
  LogContextPlugin,
  SystemContextPlugin,
  toBool,
} from '@kcws/github-actions'

export const contextBuilder = ContextBuilder.fromPackageJson(__dirname)
  .addPlugin(new EnvContextPlugin())
  .addPlugin(new LogContextPlugin())
  .addPlugin(new InputContextPlugin())
  .addPlugin(new ExecContextPlugin())
  .addPlugin(new CacheContextPlugin())
  .addPlugin(new SystemContextPlugin())
  .addPlugin(new IOContextPlugin())

export default AppBuilder.fromBuilders(contextBuilder, async context => {
  const inputs = context.use('input')
  const loggers = context.use('log')

  const workDirectory = inputs.optionalString('workdir') ?? process.cwd()
  const asdfDirectory = inputs.optionalString('asdfdir') ?? join(homedir(), '.asdf')

  const toolFile = join(workDirectory, '.tool-versions')
  const toolFileExist = existsSync(toolFile)

  let toolInstall = inputs.optional('install-tools', toBool) ?? false
  if (toolInstall && !toolFileExist) {
    loggers.warn('cannot install tools because file is missing', {
      title: '.tool-versions file is missing',
      file: toolFile,
    })

    // Force tool install to be disabled because no tool-versions found
    toolInstall = false
  }

  const ref = inputs.requiredString('ref')
  const cacheEnabled = inputs.optional('cache-enabled', toBool) ?? true
  const key = inputs.optionalString('cache-key')
  const cacheKeys = []

  if (ref) cacheKeys.push(ref)
  if (toolFileExist) cacheKeys.push(await context.use('io').hash('.tool-versions', workDirectory))
  if (key) cacheKeys.push(key)

  loggers.debug('Install reference: {0}', ref)
  loggers.debug('Install tools: {0}', toolInstall)
  loggers.debug('Install cache: {0}', cacheEnabled)
  loggers.debug('Install cache keys: {0}', cacheKeys.join(','))
  return {
    input: {
      ref,
      toolInstall,
      cacheEnabled,
      cacheKeys,
      toolFile,
      asdfDirectory,
      workDirectory,
    },
  }
})
