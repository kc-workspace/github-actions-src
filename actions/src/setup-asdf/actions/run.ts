import type { AppRunner } from "@utils/actions"
import type App from "../app"

const action: AppRunner<typeof App> = (data, context) => {
  context.use("log").info("hello {0}", data.input.ref)
}

export default action
