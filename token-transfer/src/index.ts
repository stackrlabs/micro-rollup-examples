import { Request, Response } from "express";

import { ActionEvents } from "@stackr/sdk";
import { Playground } from "@stackr/sdk/plugins";
import dotenv from "dotenv";
import { setupServer } from "./server.ts";
import { mru } from "./stackr/mru.ts";

dotenv.config();

if (process.env.NODE_ENV === "development") {
  const playground = Playground.init(mru);

  // addGetMethod from Playground can be used to add custom routes
  playground.addGetMethod(
    "/custom/hello",
    async (_req: Request, res: Response) => {
      res.json({
        message: "Hello from the custom route",
      });
    }
  );
}

const { events } = mru;

events.subscribe(ActionEvents.SUBMIT, (args) => {
  console.log(
    `📢 Action Submitted with transition ${
      args.actionName
    } & Payload ${JSON.stringify(args.payload)}`
  );
});

events.subscribe(ActionEvents.EXECUTION_STATUS, async (action) => {
  console.log(
    `📢 Execution Status Update on Action => "${action.actionHash}"`,
    action.status
  );
});

setupServer();
