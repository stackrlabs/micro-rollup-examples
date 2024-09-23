import { MicroRollup } from "@stackr/sdk";

import { stackrConfig } from "../../stackr.config";
import { machine } from "./machine";

const mru = await MicroRollup({
  config: stackrConfig,
  stateMachines: [machine],
});

await mru.init();

export { mru };
