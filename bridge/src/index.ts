import { Bridge } from "@stackr/sdk/plugins";
import dotenv from "dotenv";
import { AbiCoder, formatEther, Wallet } from "ethers";

import { mru } from "./stackr/mru.ts";
import { MintTokenSchema } from "./stackr/schemas.ts";
import { signMessage } from "./utils.ts";

dotenv.config();

const abiCoder = AbiCoder.defaultAbiCoder();
const operator = new Wallet(process.env.PRIVATE_KEY as string);

async function main() {
  // Add Handlers on Bridge attached to Rollup
  Bridge.init(mru, {
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
