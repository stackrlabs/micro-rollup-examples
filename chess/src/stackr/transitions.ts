import { Transitions, SolidityType } from "@stackr/sdk/machine";

import { ChessState } from "./state";

const move = ChessState.STF({
  schema: {
    move: SolidityType.STRING,
  },
  handler: ({ state, inputs }) => {
    state.move(inputs.move);
    return state;
  },
});

const transitions: Transitions<ChessState> = {
  move,
};

export { transitions };
