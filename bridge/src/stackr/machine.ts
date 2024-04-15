import { State, StateMachine } from "@stackr/sdk/machine";
import { solidityPackedKeccak256, ZeroHash } from "ethers";
import MerkleTree from "merkletreejs";

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

  getRootHash(): string {
    if (this.state.length === 0) {
      return ZeroHash;
    }
    const hashes = this.state.map(({ address, balance }) =>
      solidityPackedKeccak256(["address", "uint"], [address, balance])
    );
    const tree = new MerkleTree(hashes);
    return tree.getHexRoot();
  }
}

const machine = new StateMachine({
  id: "bridge",
  stateClass: BridgeState,
  initialState: genesisState.state as Balances,
  on: transitions,
});

export { machine };
