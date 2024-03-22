import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../../genesis-state.json";
import { ChessState } from "./state";
import { transitions } from "./transitions";

const STATE_MACHINES = {
  CHESS: "chess",
};

const chessStateMachine = new StateMachine({
  id: STATE_MACHINES.CHESS,
  initialState: genesisState.state,
  stateClass: ChessState,
  on: transitions,
});

export { STATE_MACHINES, chessStateMachine };
