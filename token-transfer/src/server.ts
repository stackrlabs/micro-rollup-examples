import express, { Request, Response } from "express";

import dotenv from "dotenv";
import { STATE_MACHINES } from "./stackr/machine.ts";
import { ERC20Machine, mru } from "./stackr/mru.ts";
import { schemas } from "./stackr/schemas.ts";
import { transitions } from "./stackr/transitions.ts";

dotenv.config();

export const setupServer = () => {
  const machine = mru.stateMachines.get<ERC20Machine>(STATE_MACHINES.ERC20);

  if (!machine) {
    throw new Error("Machine not found");
  }

  const app = express();
  app.use(express.json());

  const { actions, chain, getStfSchemaMap } = mru;

  app.get("/actions/:hash", async (req: Request, res: Response) => {
    const { hash } = req.params;
    const action = await actions.getByHash(hash);
    if (!action) {
      return res.status(404).send({ message: "Action not found" });
    }
    return res.send(action);
  });

  app.get("/blocks/:hash", async (req: Request, res: Response) => {
    const { hash } = req.params;
    const block = await chain.getBlockByHash(hash);
    if (!block) {
      return res.status(404).send({ message: "Block not found" });
    }
    return res.send(block);
  });

  app.post("/:transitionName", async (req: Request, res: Response) => {
    const { transitionName } = req.params;

    if (!transitions[transitionName]) {
      res
        .status(400)
        .send({ message: `Transition ${transitionName} not found` });
      return;
    }

    const { msgSender, signature, inputs } = req.body;

    const stfSchemaMap = getStfSchemaMap();
    const schemaName = stfSchemaMap[transitionName] as keyof typeof schemas;

    const schema = schemas[schemaName];

    try {
      const action = schema.actionFrom({ msgSender, signature, inputs });
      const ack = await mru.submitAction(transitionName, action);
      res.status(201).send({ ack });
    } catch (e: any) {
      res.status(400).send({ error: e.message });
    }
    return;
  });

  app.get("/", (_req: Request, res: Response) => {
    return res.send({ state: machine.state });
  });

  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};
