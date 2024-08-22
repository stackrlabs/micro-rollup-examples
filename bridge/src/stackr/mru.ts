import { MicroRollup } from "@stackr/sdk";

import { stackrConfig } from "../../stackr.config.ts";
import { machine } from "../stackr/machine.ts";
import { MintTokenSchema } from "../stackr/schemas.ts";

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [MintTokenSchema],
  stateMachines: [machine],
  // NOTE: this is optional, but when defined it'll perform checks on schema configured to the STF
  stfSchemaMap: {
    mintToken: MintTokenSchema,
  },
});

await mru.init();

export { mru };
