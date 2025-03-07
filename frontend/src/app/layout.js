"use client";

import "@/styles/globals.css";


import { NetworkId } from "@/config";
import { NearContext, Wallet } from "@/wallets/near";
import { useEffect, useState } from "react";
import Navigation from "../components/navigation";

// Wallet instance
const wallet = new Wallet({ networkId: NetworkId });

// Optional: Create an access key so the user does not need to sign transactions. Read more about access keys here: https://docs.near.org/concepts/protocol/access-keys
//const wallet = new Wallet({ networkId: NetworkId, createAccessKeyFor: HelloNearContract });

export default function RootLayout({ children }) {
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => { wallet.startUp(setSignedAccountId) }, []);

  return (
    <html lang="en">
      <body>
        <NearContext.Provider value={{ wallet, signedAccountId }}>
          <Navigation />
          {children}
        </NearContext.Provider>
      </body>
    </html>
  );
}
