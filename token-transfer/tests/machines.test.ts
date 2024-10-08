import { Domain } from "@stackr/sdk";
import { StateMachine } from "@stackr/sdk/machine";
import { describe, expect, it } from "bun:test";
import { Wallet, ZeroHash, verifyTypedData } from "ethers";

import genesisState from "../genesis-state.json";
import { ERC20, Leaves } from "../src/stackr/state";
import { transitions } from "../src/stackr/transitions";
import { stackrConfig } from "../stackr.config";

const getAccountWiseBalances = (accounts: Leaves) => {
  return accounts.reduce((balances, { address, balance }) => {
    balances[address] = balance;
    return balances;
  }, {} as Record<string, number>);
};

describe("Token Machine Behaviours", () => {
  const STATE_MACHINES = {
    ERC20: "erc-20",
  };

  const machine = new StateMachine({
    id: STATE_MACHINES.ERC20,
    stateClass: ERC20,
    initialState: genesisState.state,
    on: transitions,
  });
  const domain = stackrConfig.domain as Domain;
  machine.setDomain(domain);

  const ALICE_ADDRESS =
    "0x0123456789012345678901234567890123456789012345678901234567890124";
  const BOB_ADDRESS =
    "0x0123456789012345678901234567890123456789012345678901234567890123";
  const CHARLIE_ADDRESS =
    "0x0123456789012345678901234567890123456789012345678901234567890125";
  const block = {
    height: 1,
    timestamp: 121312312,
    parentHash:
      "0x0123456789012345678901234567890123456789012345678901234567890126",
  };

  const aliceWallet = new Wallet(ALICE_ADDRESS);
  const bobWallet = new Wallet(BOB_ADDRESS);
  const charlieWallet = new Wallet(CHARLIE_ADDRESS);

  it("should have the correct id", () => {
    expect(machine.id).toStrictEqual(STATE_MACHINES.ERC20);
  });

  it("should have correct root as per initial state", () => {
    expect(machine.stateRootHash).toStrictEqual(ZeroHash);
  });

  it("should be able to create new account", async () => {
    const msgSender = bobWallet.address;
    const name = "create";
    const inputs = {
      address: msgSender,
    };
    const signature = await bobWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    machine.reduce({
      name,
      payload: inputs,
      msgSender,
      signature,
      block,
    });

    const leaves = machine.state;

    expect(leaves.length).toStrictEqual(1);

    const { address, balance, allowances } = leaves[0];
    expect(address).toStrictEqual(msgSender);
    expect(balance).toStrictEqual(0);
    expect(allowances).toStrictEqual([]);
  });

  it("should be able to mint tokens", async () => {
    const AMOUNT_TO_MINT = 42;
    const msgSender = bobWallet.address;
    const name = "mint";
    const inputs = {
      to: msgSender,
      from: msgSender,
      amount: AMOUNT_TO_MINT,
      nonce: 1,
    };
    const signature = await bobWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    machine.reduce({
      name,
      payload: inputs,
      msgSender,
      signature,
      block,
    });

    const accounts = machine.state;
    expect(accounts.length).toStrictEqual(1);

    const { address, balance, allowances } = accounts[0];
    expect(address).toStrictEqual(msgSender);
    expect(balance).toStrictEqual(AMOUNT_TO_MINT);
    expect(allowances).toStrictEqual([]);
  });

  it("should be allow burning own token", async () => {
    const initialState = machine.state;
    const bobAccount = initialState.find(
      (account) => account.address === bobWallet.address
    );
    if (!bobAccount) {
      throw new Error("Account not found");
    }
    const bobBalance = bobAccount.balance;

    const AMOUNT_TO_BURN = 20;
    const msgSender = bobWallet.address;
    const name = "burn";
    const inputs = {
      to: msgSender,
      from: msgSender,
      amount: AMOUNT_TO_BURN,
      nonce: 2,
    };

    const signature = await bobWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs },
    );

    const signer = verifyTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs },
      signature
    );

    machine.reduce({
      name,
      payload: inputs,
      msgSender: signer,
      signature,
      block,
    });

    const accounts = machine.state;
    expect(accounts.length).toStrictEqual(1);

    const { address, balance, allowances } = accounts[0];
    expect(address).toStrictEqual(msgSender);
    expect(balance).toStrictEqual(bobBalance - AMOUNT_TO_BURN);
    expect(allowances).toStrictEqual([]);
  });

  it("should not allow burning someone else's tokens", async () => {
    const AMOUNT_TO_BURN = 20;

    const initialStateRoot = machine.stateRootHash;
    const msgSender = aliceWallet.address;
    const targetAccount = bobWallet.address;

    const name = "burn";
    const inputs = {
      to: targetAccount,
      from: targetAccount,
      amount: AMOUNT_TO_BURN,
      nonce: 3,
    };

    const signature = await aliceWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    expect(() => {
      machine.reduce({
        name,
        payload: inputs,
        msgSender,
        signature,
        block,
      });
    }).toThrowError("Unauthorized");

    const finalStateRoot = machine.stateRootHash;
    expect(initialStateRoot).toStrictEqual(finalStateRoot);
  });

  it("should be able to create another account", async () => {
    const msgSender = aliceWallet.address;
    const name = "create"
    const inputs = {
      address: msgSender,
    };

    const signature = await aliceWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    machine.reduce({
      name,
      payload: inputs,
      msgSender,
      signature,
      block,
    });

    const leaves = machine.state;

    expect(leaves.length).toStrictEqual(2);

    const aliceAccount = leaves.find(
      (account) => account.address === aliceWallet.address
    );
    if (!aliceAccount) {
      throw new Error("Account not found");
    }

    const { address, balance, allowances } = aliceAccount;
    expect(address).toStrictEqual(msgSender);
    expect(balance).toStrictEqual(0);
    expect(allowances).toStrictEqual([]);
  });

  it("should be able to transfer tokens, if sufficient balance", async () => {
    const msgSender = bobWallet.address;
    const initialBalances = getAccountWiseBalances(machine.state);

    const AMOUNT_TO_TRANSFER = Math.floor(initialBalances[msgSender] / 2);

    const name = "transfer";
    const inputs = {
      to: aliceWallet.address,
      from: msgSender,
      amount: AMOUNT_TO_TRANSFER,
      nonce: 3,
    };

    const signature = await bobWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    machine.reduce({
      name,
      payload: inputs,
      msgSender,
      signature,
      block,
    });

    const accounts = machine.state;
    expect(accounts.length).toStrictEqual(2);

    const aliceAccount = accounts.find(
      (account) => account.address === aliceWallet.address
    );

    if (!aliceAccount) {
      throw new Error("Account not found");
    }

    const bobAccount = accounts.find(
      (account) => account.address === bobWallet.address
    );

    if (!bobAccount) {
      throw new Error("Account not found");
    }

    expect(aliceAccount.balance).toStrictEqual(
      initialBalances[aliceWallet.address] + AMOUNT_TO_TRANSFER
    );

    expect(bobAccount.balance).toStrictEqual(
      initialBalances[msgSender] - AMOUNT_TO_TRANSFER
    );
  });

  it("should not allow token transfer to unregistered account", async () => {
    const msgSender = bobWallet.address;

    const initialStateRoot = machine.stateRootHash;
    const initialBalances = getAccountWiseBalances(machine.state);

    const AMOUNT_TO_TRANSFER = Math.floor(initialBalances[msgSender] / 2);

    const name = "transfer";
    const inputs = {
      to: charlieWallet.address,
      from: msgSender,
      amount: AMOUNT_TO_TRANSFER,
      nonce: 4,
    };

    const signature = await bobWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    expect(() => {
      machine.reduce({
        name,
        payload: inputs,
        msgSender,
        signature,
        block,
      });
    }).toThrowError("Account does not exist");

    const finalStateRoot = machine.stateRootHash;
    expect(initialStateRoot).toStrictEqual(finalStateRoot);
  });

  it("should not allow token transfer if insufficient balance", async () => {
    const msgSender = bobWallet.address;

    const initialStateRoot = machine.stateRootHash;
    const initialBalances = getAccountWiseBalances(machine.state);

    const AMOUNT_TO_TRANSFER = Math.floor(initialBalances[msgSender] * 2);

    const name = "transfer";
    const inputs = {
      to: aliceWallet.address,
      from: msgSender,
      amount: AMOUNT_TO_TRANSFER,
      nonce: 4,
    };

    const signature = await bobWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    expect(() => {
      machine.reduce({
        name,
        payload: inputs,
        msgSender,
        signature,
        block,
      });
    }).toThrowError("Insufficient funds");

    const finalStateRoot = machine.stateRootHash;
    expect(initialStateRoot).toStrictEqual(finalStateRoot);
  });

  it("should not allow action with invalid nonce", async () => {
    const AMOUNT_TO_MINT = 42;
    const msgSender = bobWallet.address;
    const initialStateRoot = machine.stateRootHash;

    const name = "mint";
    const inputs = {
      to: msgSender,
      from: msgSender,
      amount: AMOUNT_TO_MINT,
      nonce: 0,
    };

    const signature = await bobWallet.signTypedData(
      domain,
      machine.stfToSchemaMap[name],
      { name, inputs }
    );

    expect(() => {
      machine.reduce({
        name,
        payload: inputs,
        msgSender,
        signature,
        block,
      });
    }).toThrowError("Invalid nonce");

    const finalStateRoot = machine.stateRootHash;
    expect(initialStateRoot).toStrictEqual(finalStateRoot);
  });
});
