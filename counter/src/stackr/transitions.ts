import { Transitions, SolidityType } from "@stackr/sdk/machine";

import { CounterState } from "./state";

const increment = CounterState.STF({
  schema: {
    timestamp: SolidityType.UINT,
  },
  handler: ({ state, emit }) => {
    state += 1;
    emit({ name: "ValueAfterIncrement", value: state });
    return state;
  },
});

const decrement = CounterState.STF({
  schema: {
    timestamp: SolidityType.UINT,
  },
  handler: ({ state, emit }) => {
    state -= 1;
    emit({ name: "ValueAfterDecrement", value: state });
    return state;
  },
});

export const transitions: Transitions<CounterState> = {
  increment,
  decrement,
};
