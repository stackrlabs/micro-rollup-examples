import { Transitions, SolidityType } from "@stackr/sdk/machine";

import { BridgeState } from "./state";

const mintToken = BridgeState.STF({
  schema: {
    address: SolidityType.ADDRESS,
    amount: SolidityType.UINT,
  },
  handler: ({ state, inputs }) => {
    const accountIdx = state.findIndex(
      (account) => account.address === inputs.address
    );

    if (accountIdx === -1) {
      state.push({
        address: inputs.address,
        balance: inputs.amount,
      });
    } else {
      state[accountIdx].balance += inputs.amount;
    }

    return state;
  },
});

export const transitions: Transitions<BridgeState> = {
  mintToken,
};
