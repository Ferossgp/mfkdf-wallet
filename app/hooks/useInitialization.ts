import { createWeb3Wallet } from '../lib/walletconnect'
import { useCallback, useEffect, useState } from 'react'

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false)

  const onInitialize = useCallback(async () => {
    try {
      await createWeb3Wallet()
      setInitialized(true)
    } catch (err: unknown) {
      console.error('Initialization failed', err)
      alert(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!initialized) {
      onInitialize()
    }
  }, [initialized, onInitialize])

  return initialized
}