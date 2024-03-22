import { STF, Transitions } from "@stackr/sdk/machine";
import { ChessState } from "./state";

type ActionInput = { move: string };

const move: STF<ChessState, ActionInput> = {
  handler: ({ state, inputs }) => {
    state.move(inputs.move);
    return state;
  },
};

const transitions: Transitions<ChessState> = {
  move,
};

export { transitions };
