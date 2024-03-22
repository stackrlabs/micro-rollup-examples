import { Playground } from "@stackr/sdk/plugins";
import inquirer from "inquirer";
import { moveSchema } from "./stackr/actions.ts";
import { chessStateMachine } from "./stackr/chess.machine.ts";
import { mru } from "./stackr/chess.mru.ts";
import { prettyTurnName, signByOperator, sleep } from "./utils.ts";

if (process.env.NODE_ENV !== "production") {
  Playground.init(mru);
  await sleep(1000);
}

const machine = mru.stateMachines.get<typeof chessStateMachine>("chess");
if (!machine) {
  throw new Error("Chess machine not found");
}

while (true) {
  // print the board
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
  const moveNumber = board.moveNumber();
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
    "move",
    moveSchema.actionFrom({ inputs, msgSender, signature })
  );

  await sleep(500);
}
