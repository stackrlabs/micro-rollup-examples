import { MicroRollup, MicroRollupResponse } from "@stackr/sdk";
import { StateMachine } from "@stackr/sdk/machine";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Chess } from "chess.js";

import genesisState from "../genesis-state.json";
import { chessStateMachine } from "../src/stackr/machine.ts";
import { ChessState } from "../src/stackr/state.ts";
import { transitions } from "../src/stackr/transitions.ts";
import { signByOperator, sleep } from "../src/utils.ts";
import { stackrConfig } from "../stackr.config.ts";

describe("Chess MRU", async () => {
  let mru: MicroRollupResponse;

  const machine = new StateMachine({
    id: "chess",
    initialState: genesisState.state,
    stateClass: ChessState,
    on: transitions,
  });

  beforeEach(async () => {
    mru = await MicroRollup({
      config: {
        ...stackrConfig,
        sequencer: {
          blockSize: 1,
          blockTime: 1,
        },
        logLevel: "error",
      },
      stateMachines: [machine],
    });

    await mru.init();
  });

  describe("Pick and execute a move", async () => {
    it("should pick and execute a move", async () => {
      const chessMachine =
        mru.stateMachines.get<typeof chessStateMachine>("chess");
      if (!chessMachine) {
        throw new Error("Chess machine not found");
      }

      const moves = chessMachine.wrappedState.moves();
      const move = moves[0];

      const inputs = {
        move,
      };

      const { msgSender, signature } = await signByOperator(
        mru.config.domain,
        mru.getStfSchemaMap()["move"],
        inputs
      );
      await mru.submitAction({
        name: "move",
        signature,
        inputs,
        msgSender,
      });

      await sleep(100);

      const replicaBoard = new Chess();
      replicaBoard.move(move);

      expect(chessMachine.wrappedState.turn()).toStrictEqual(
        replicaBoard.turn()
      );

      expect(chessMachine.state).toStrictEqual(replicaBoard.fen());
    });
  });

  afterEach(async () => {
    await mru.shutdown();
  });
});
