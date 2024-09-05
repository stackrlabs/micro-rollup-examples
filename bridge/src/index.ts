import { ActionParams } from "@stackr/sdk";
import { Bridge } from "@stackr/sdk/plugins";
import dotenv from "dotenv";
import { AbiCoder, formatEther, Wallet } from "ethers";

import { mru } from "./stackr/mru.ts";
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

        const domain = mru.config.domain;
        const types = mru.getStfSchemaMap()["mintToken"];
        const signature = await signMessage(operator, domain, types, inputs);
        const actionParams: ActionParams = {
          name: "mintToken",
          inputs,
          signature,
          msgSender: operator.address,
        };

        return {
          actionParams,
        };
      },
    },
  });
  console.log("Waiting for BRIDGE_ETH event on the bridge contract...");
}

main();
