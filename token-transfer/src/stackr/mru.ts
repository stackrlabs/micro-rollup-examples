import { MicroRollup } from "@stackr/sdk";

import { stackrConfig } from "../../stackr.config.ts";
import { erc20StateMachine } from "./machine.ts";

type ERC20Machine = typeof erc20StateMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  stateMachines: [erc20StateMachine],
});

await mru.init();

export { ERC20Machine, mru };
