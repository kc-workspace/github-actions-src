import { exec } from "@actions/exec"
import { mockEnvironment } from "@utils/mocks"

import { ContextBuilder } from ".."
import { ExecContextPlugin } from "./executors"

jest.mock("@actions/exec")
jest.mock("@actions/core")

describe("utils.contexts.plugins.executors", () => {
  const plugin = new ExecContextPlugin()
  const context = ContextBuilder.builder().addPlugin(plugin).build()

  test("add plugin should usable with use()", () => {
    expect(context.use("exec")).toEqual(plugin)
    expect(context.use("exec").name).toEqual("exec")
  })

  test("run some command", async () => {
    await context.use("exec").run("ls", "-la")

    expect(exec).toHaveBeenCalledTimes(1)
    expect(exec).toHaveBeenCalledWith("ls", ["-la"], undefined)
  })

  test("run some command with options", async () => {
    await context.use("exec").withOptions({ cwd: "/tmp" }).run("ls", "-la")
    await context.use("exec").run("ls", "-la")

    expect(exec).toHaveBeenCalledTimes(2)
    expect(exec).toHaveBeenNthCalledWith(1, "ls", ["-la"], { cwd: "/tmp" })
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(exec).toHaveBeenNthCalledWith(2, "ls", ["-la"], undefined)
  })

  test("rerun some command with same options", async () => {
    await context.use("exec").withOptions({ cwd: "/tmp" }).rerun("ls", "-la")
    await context.use("exec").rerun("ls", "-la")

    expect(exec).toHaveBeenCalledTimes(2)
    expect(exec).toHaveBeenNthCalledWith(1, "ls", ["-la"], { cwd: "/tmp" })
    expect(exec).toHaveBeenNthCalledWith(2, "ls", ["-la"], { cwd: "/tmp" })
  })

  test("dry-run some command", async () => {
    const environment = {
      DRYRUN: "true",
    }

    await mockEnvironment(environment, async () => {
      const context_ = ContextBuilder.builder().addPlugin(plugin).build()

      await context_.use("exec").run("ls", "-la")
      // Because dry-run is enabled
      expect(exec).toHaveBeenCalledTimes(0)
    })
  })
})
