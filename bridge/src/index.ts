import { MicroRollup } from "@stackr/sdk";
import { Bridge } from "@stackr/sdk/plugins";
import dotenv from "dotenv";
import { AbiCoder, formatEther, Wallet } from "ethers";

import { stackrConfig } from "../stackr.config.ts";
import { machine } from "./stackr/machine.ts";
import { MintTokenSchema } from "./stackr/schemas.ts";
import { signMessage } from "./utils.ts";

dotenv.config();

const abiCoder = AbiCoder.defaultAbiCoder();
const operator = new Wallet(process.env.PRIVATE_KEY as string);

async function main() {
  const rollup = await MicroRollup({
    config: stackrConfig,
    actionSchemas: [MintTokenSchema],
    stateMachines: [machine],
    // NOTE: this is optional, but when defined it'll perform checks on schema configured to the STF
    stfSchemaMap: {
      mintToken: MintTokenSchema,
    },
  });
  await rollup.init();

  Bridge.init(rollup, {
    handlers: {
      BRIDGE_ETH: async (args) => {
        const [to, amount] = abiCoder.decode(["address", "uint"], args.data);
        console.log("Minting token to", to, "with amount", amount);
        const inputs = {
          address: to,
          amount: Number(formatEther(amount)),
        };

        const signature = await signMessage(operator, MintTokenSchema, inputs);
        const action = MintTokenSchema.actionFrom({
          inputs,
          signature,
          msgSender: operator.address,
        });

        return {
          transitionName: "mintToken",
          action,
        };
      },
    },
  });
  console.log("Waiting for BRIDGE_ETH event on the bridge contract...");
}

main();
