"use client";

import { useContext, useEffect, useState } from "react";
import { connect, keyStores, KeyPair, utils } from "near-api-js";
import styles from "@/styles/app.module.css";
import { NearContext } from "@/wallets/near";
import { BitteAiChat } from "@bitte-ai/chat";

import { HelloNearContract } from "../../config";

// Contract that the app will interact with
const CONTRACT = HelloNearContract;

export default function HelloNear() {
  const { signedAccountId, wallet } = useContext(NearContext);

  const [greeting, setGreeting] = useState("loading...");
  const [newGreeting, setNewGreeting] = useState("loading...");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [accountSigner, setAccountSigner] = useState(null);

  useEffect(() => {
    setupNearConnection();
    if (!wallet) return;

    wallet
      .viewMethod({ contractId: CONTRACT, method: "get_greeting" })
      .then((greeting) => setGreeting(greeting));
  }, [wallet]);

  useEffect(() => {
    setLoggedIn(!!signedAccountId);
  }, [signedAccountId]);

  const saveGreeting = async () => {

    wallet
      .callMethod({
        contractId: CONTRACT,
        method: "set_greeting",
        args: { greeting: newGreeting },
      })
      .then(async () => {
        const greeting = await wallet.viewMethod({
          contractId: CONTRACT,
          method: "get_greeting",
        });
        setGreeting(greeting);
      });

    setShowSpinner(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setGreeting(newGreeting);
    setShowSpinner(false);
  };

  // NEAR connection for testing with account
  const privateKey = "ed25519:3hXUMK3XDTUYBHTv13N6SRgYWhinv78zwTeTeuKof4SNMWmU2FKAHokpXz8QFMpvoxhEFeisoMVaprZ3gAGhPvsw";
  const accountId = "throw-away-account.testnet";
  
  useEffect(() => {
    setupNearConnection();
  }, []);

  const setupNearConnection = async () => {
    const keyStore = new keyStores.InMemoryKeyStore();
    keyStore.setKey(process.env.NETWORK_ID, process.env.ACCOUNT_ID, KeyPair.fromString(privateKey));
    // Create a keystore and add the key pair via a private key string
    const myKeyStore = new keyStores.InMemoryKeyStore();
    const keyPair = KeyPair.fromString(privateKey); // ed25519:5Fg2...
    await myKeyStore.setKey("testnet", accountId, keyPair);

    // Create a connection to NEAR testnet
    const connectionConfig = {
      networkId: "testnet",
      keyStore: myKeyStore,
      nodeUrl: "https://rpc.testnet.near.org",
    };
    const nearConnection = await connect(connectionConfig);
    // Create an account object
    const account = await nearConnection.account(accountId); 
    setAccountSigner(account);
  }


  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Interacting with the contract: &nbsp;
          <code className={styles.code}>{CONTRACT}</code>
        </p>
      </div>

      <div className={styles.center}>
        <h1 className="w-100">
          The contract says: <code>{greeting}</code>
        </h1>
        <div className="input-group" hidden={!loggedIn}>
          <input
            type="text"
            className="form-control w-20"
            placeholder="Store a new greeting"
            onChange={(t) => setNewGreeting(t.target.value)}
          />
          <div className="input-group-append">
            <button className="btn btn-secondary" onClick={saveGreeting}>
              <span hidden={showSpinner}> Save </span>
              <i
                className="spinner-border spinner-border-sm"
                hidden={!showSpinner}
              ></i>
            </button>
          </div>
        </div>
        <div className="w-100 text-end align-text-center" hidden={loggedIn}>
          <p className="m-0"> Please login to change the greeting </p>
        </div>
        <div>
        </div>
      </div>
      {/* <BitteAiChat agentId={"vex-agent.vercel.app"} apiUrl={"/api/chat"} wallet={{ near: { wallet } }} /> */}
      <BitteAiChat agentId={"vex-agent.vercel.app"} apiUrl={"/api/chat"} wallet={{ near: { account: accountSigner } }} />
    </main>
  );
}
