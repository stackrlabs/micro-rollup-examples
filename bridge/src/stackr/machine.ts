import { StateMachine } from "@stackr/sdk/machine";

import * as genesisState from "../../genesis-state.json";
import { Balances, BridgeState } from "./state";
import { transitions } from "./transitions";

const machine = new StateMachine({
  id: "bridge",
  stateClass: BridgeState,
  initialState: genesisState.state as Balances,
  on: transitions,
});

export { machine };
