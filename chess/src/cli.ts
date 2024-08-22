import inquirer from "inquirer";
import { chessStateMachine, STATE_MACHINES } from "./stackr/machine";
import { mru } from "./stackr/mru";
import { moveSchema } from "./stackr/schemas.ts";
import { prettyTurnName, signByOperator, sleep } from "./utils";

/**
 * Play the game using the CLI
 * Uses inquirer to prompt the user for moves
 */
export const play = async () => {
  const machine = mru.stateMachines.get<typeof chessStateMachine>(
    STATE_MACHINES.CHESS
  );

  if (!machine) {
    throw new Error("Chess machine not found");
  }

  // Always keep it running
  while (true) {
    const board = machine.wrappedState;

    console.log(`Current State: ${machine.state}\n`);
    console.log(board.ascii());

    // get the moves
    const moves = board.moves();
    if (moves.length === 0) {
      console.log("Game over");
      break;
    }

    const player = prettyTurnName(board.turn());
    const choices = board.moves();

    console.log("\n");
    const { move } = await inquirer.prompt([
      {
        type: "list",
        name: "move",
        message: `Select ${player}'s Move`,
        choices,
        validate(input: string) {
          if (input.length === 0) {
            return "Move is required";
          }
          return true;
        },
      },
    ]);

    const inputs = {
      move,
    };

    const { msgSender, signature } = await signByOperator(moveSchema, inputs);

    await mru.submitAction(
      "move", // transition function name
      moveSchema.actionFrom({ inputs, msgSender, signature })
    );

    await sleep(500);
  }
};