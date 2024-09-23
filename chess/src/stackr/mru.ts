import { MicroRollup } from "@stackr/sdk";

import { stackrConfig } from "../../stackr.config.ts";
import { chessStateMachine } from "./machine.ts";

const mru = await MicroRollup({
  config: stackrConfig,
  stateMachines: [chessStateMachine],
});

await mru.init();

export { mru };
