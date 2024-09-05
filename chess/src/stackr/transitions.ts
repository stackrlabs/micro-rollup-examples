import { STF, Transitions, SolidityType } from "@stackr/sdk/machine";

import { ChessState } from "./state";

const moveSchema = {
  move: SolidityType.STRING,
} as const;

const move: STF<ChessState, typeof moveSchema> = {
  schema: moveSchema,
  handler: ({ state, inputs }) => {
    state.move(inputs.move);
    return state;
  },
};

const transitions: Transitions<ChessState> = {
  move,
};

export { transitions };
