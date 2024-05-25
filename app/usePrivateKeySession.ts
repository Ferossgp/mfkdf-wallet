import { useEffect } from "react";
import { SESSION_STORAGE_KEY } from "./constants";
import { useSessionStorage } from "usehooks-ts";

export function usePrivateKeySession(pk?: string | null) {
  const [, setPrivateKey] = useSessionStorage<string | null>(SESSION_STORAGE_KEY, null);

  useEffect(() => {
    if (pk) {
      console.log("setting pk", pk);
      setTimeout(() => {
        setPrivateKey(pk);
      }, 0);
    }
  }, [pk, setPrivateKey]);
}
