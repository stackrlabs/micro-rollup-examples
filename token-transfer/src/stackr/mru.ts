import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config.ts";

import { erc20StateMachine } from "./machine.ts";
import { schemas } from "./schemas.ts";

type ERC20Machine = typeof erc20StateMachine;

const { create, transfer, transferFrom, mint, burn, approve } = schemas;

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [create, transfer, transferFrom, mint, burn, approve],
  stateMachines: [erc20StateMachine],
  stfSchemaMap: {
    create,
    transfer,
    transferFrom,
    mint,
    burn,
    approve,
  },
});

await mru.init();

export { ERC20Machine, mru };
