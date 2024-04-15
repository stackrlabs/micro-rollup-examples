import { ActionSchema, AllowedInputTypes, MicroRollup } from "@stackr/sdk";
import { Bridge } from "@stackr/sdk/plugins";
import { Wallet, AbiCoder } from "ethers";
import dotenv from "dotenv";

import { stackrConfig } from "../stackr.config.ts";
import { machine } from "./stackr/machine.ts";
import { MintTokenSchema } from "./stackr/action.ts";

dotenv.config();

const abiCoder = AbiCoder.defaultAbiCoder();
const operator = new Wallet(process.env.PRIVATE_KEY as string);

const signMessage = async (
    wallet: Wallet,
    schema: ActionSchema,
    payload: AllowedInputTypes
) => {
    const signature = await wallet.signTypedData(
        schema.domain,
        schema.EIP712TypedData.types,
        payload
    );
    return signature;
};


async function main() {
    const rollup = await MicroRollup({
        config: stackrConfig,
        actionSchemas: [MintTokenSchema],
        stateMachines: [machine]
    })
    await rollup.init();

    Bridge.init(rollup, {
        handlers: {
            'BRIDGE_ETH': async (args) => {
                const [_to, _amount] = abiCoder.decode(['address', 'uint'], args.data);

                const inputs = {
                    address: _to,
                    amount: Number(_amount)
                }

                const signature = await signMessage(operator, MintTokenSchema, inputs);
                const action = MintTokenSchema.actionFrom({
                    inputs,
                    signature,
                    msgSender: operator.address
                })

                return {
                    transitionName: 'mintToken',
                    action: action
                }
            }
        }
    })

}

main();
