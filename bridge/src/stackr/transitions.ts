import { STF, Transitions, SolidityType } from "@stackr/sdk/machine";

import { BridgeState } from "./state";

const mintTokenSchema = {
  address: SolidityType.ADDRESS,
  amount: SolidityType.UINT,
} as const;

const mintToken: STF<BridgeState, typeof mintTokenSchema> = {
  schema: mintTokenSchema,
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
};

export const transitions: Transitions<BridgeState> = {
  mintToken,
};
