import { State } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";

export type Balances = {
  address: string;
  balance: number;
}[];

export class BridgeState extends State<Balances> {
  constructor(state: Balances) {
    super(state);
  }

  // NOTE: intentionally omitted the transformer method as the state is already in the correct format

  getRootHash(): string {
    // NOTE: The following line is for testing purposes only
    // in production, the root hash should be calculated
    // by creating a merkle tree of the state leaves.
    return solidityPackedKeccak256(["string"], [JSON.stringify(this.state)]);
  }
}
