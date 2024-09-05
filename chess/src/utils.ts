import { Domain } from "@stackr/sdk";
import { AllowedInputTypes, EIP712Types } from "@stackr/sdk/machine";
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

const signByOperator = async (
  domain: Domain,
  types: EIP712Types,
  payload: AllowedInputTypes
) => {
  const { operator } = stackrConfig;
  const wallet = new Wallet(operator.accounts[0].privateKey);
  const signature = await wallet.signTypedData(domain, types, payload);
  return { msgSender: wallet.address, signature };
};

const prettyTurnName = (turn: string) => {
  return turn === "w" ? "White" : "Black";
};

export { prettyTurnName, signByOperator, sleep };
