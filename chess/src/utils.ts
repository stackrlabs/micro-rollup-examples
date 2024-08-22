import { ActionSchema } from "@stackr/sdk";
import { Wallet } from "ethers";
import { stackrConfig } from "../stackr.config";


const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Sign a message using the operator's private key
 * @param schema The defined schema for the action
 * @param payload The payload to sign
 * @returns The signature and the message sender
 */

const signByOperator = async (schema: ActionSchema, payload: any) => {
  const { operator } = stackrConfig;
  const wallet = new Wallet(operator.accounts[0].privateKey);
  const signature = await wallet.signTypedData(
    schema.domain,
    schema.EIP712TypedData.types,
    payload
  );
  return { msgSender: wallet.address, signature };
};

const prettyTurnName = (turn: string) => {
  return turn === "w" ? "White" : "Black";
};

export { prettyTurnName, signByOperator, sleep };

