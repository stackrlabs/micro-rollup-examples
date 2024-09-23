import { ActionConfirmationStatus } from "@stackr/sdk";
import { Wallet } from "ethers";

import { mru } from "./stackr/mru.ts";
import { signMessage } from "./utils.ts";

const main = async () => {
  const inputs = {
    timestamp: Date.now(),
  };

  // Create a random wallet
  const wallet = Wallet.createRandom();

  const name = "increment";
  const domain = mru.config.domain;
  const types = mru.getStfSchemaMap()[name];
  const signature = await signMessage(wallet, domain, types, { name, inputs });
  const incrementActionParams = {
    name,
    inputs,
    signature,
    msgSender: wallet.address,
  };

  const ack = await mru.submitAction(incrementActionParams);
  console.log(ack.hash);

  // leverage the ack to wait for C1 and access logs & error from STF execution
  const { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
  console.log({ logs, errors });
};

main();
