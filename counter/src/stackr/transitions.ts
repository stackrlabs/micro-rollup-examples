import { STF, Transitions, SolidityType } from "@stackr/sdk/machine";

import { CounterState } from "./state";

const schema = {
  timestamp: SolidityType.UINT,
} as const;

const increment: STF<CounterState, typeof schema> = {
  schema,
  handler: ({ state, emit }) => {
    state += 1;
    emit({ name: "ValueAfterIncrement", value: state });
    return state;
  },
};

const decrement: STF<CounterState, typeof schema> = {
  schema,
  handler: ({ state, emit }) => {
    state -= 1;
    emit({ name: "ValueAfterDecrement", value: state });
    return state;
  },
};

export const transitions: Transitions<CounterState> = {
  increment,
  decrement,
};
