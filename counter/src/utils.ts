import { Domain } from "@stackr/sdk";
import { AllowedInputTypes, EIP712Types } from "@stackr/sdk/machine";
import { HDNodeWallet } from "ethers";

export const signMessage = async (
  wallet: HDNodeWallet,
  domain: Domain,
  types: EIP712Types,
  payload: { name: string, inputs: AllowedInputTypes }
) => {
  const signature = await wallet.signTypedData(domain, types, payload);
  return signature;
};
