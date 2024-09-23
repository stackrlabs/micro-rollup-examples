import { StateMachine } from "@stackr/sdk/machine";

import genesisState from "../../genesis-state.json";
import { ERC20 } from "./state";
import { transitions } from "./transitions";

const STATE_MACHINES = {
  ERC20: "erc-20",
};

const erc20StateMachine = new StateMachine({
  id: STATE_MACHINES.ERC20,
  stateClass: ERC20,
  initialState: genesisState.state,
  on: transitions,
});

export { erc20StateMachine, STATE_MACHINES };

