import { State, StateMachine } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";

import * as genesisState from "../../genesis-state.json";
import { transitions } from "./transitions";

type Balances = {
  address: string;
  balance: number;
}[];

export class BridgeState extends State<Balances> {
  constructor(state: Balances) {
    super(state);
  }

  getRootHash() {
    return solidityPackedKeccak256(["string"], [JSON.stringify(this.state)]);
  }
}

const machine = new StateMachine({
  id: "bridge",
  stateClass: BridgeState,
  initialState: genesisState.state as Balances,
  on: transitions,
});

export { machine };
