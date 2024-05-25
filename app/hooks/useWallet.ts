import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { SESSION_STORAGE_KEY } from "~/constants";

export function useWallet() {
  const [privateKey] = useSessionStorage(SESSION_STORAGE_KEY, null)
  const [wallet, setWallet] = useState<PrivateKeyAccount | null>(null)

  useEffect(() => {
    if (privateKey) {
      setWallet(privateKeyToAccount(privateKey))
    }
  }, [privateKey])

  return wallet
}