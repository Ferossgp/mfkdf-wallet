import { useState } from "react"
import { toast } from "sonner"
import { useSessionStorage } from "usehooks-ts"
import { SESSION_STORAGE_KEY } from "~/constants"
import { parseUri } from '@walletconnect/utils'
import { web3wallet } from "~/lib/walletconnect"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { Link } from "@remix-run/react"
import useInitialization from "~/hooks/useInitialization"
import { Input } from "./ui/input"
import useWalletConnectEventsManager from "~/hooks/useWalletConnectEventsManager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import Modal from "~/modals/Modal"
import ModalStore from "~/store/ModalStore"
import { useWallet } from "~/hooks/useWallet"

export const HomeScreen: React.FC = () => {
  const [value] = useSessionStorage(SESSION_STORAGE_KEY, null)
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)

  async function onConnect() {
    const { topic: pairingTopic } = parseUri(uri)
    // if for some reason, the proposal is not received, we need to close the modal when the pairing expires (5mins)
    const pairingExpiredListener = ({ topic }: { topic: string }) => {
      if (pairingTopic === topic) {
        toast('Pairing expired. Please try again with new Connection URI', 'error')
        ModalStore.close()
        web3wallet.core.pairing.events.removeListener('pairing_expire', pairingExpiredListener)
      }
    }
    web3wallet.once('session_proposal', () => {
      web3wallet.core.pairing.events.removeListener('pairing_expire', pairingExpiredListener)
    })
    try {
      setLoading(true)
      web3wallet.core.pairing.events.on('pairing_expire', pairingExpiredListener)
      await web3wallet.pair({ uri, activatePairing: true })
      toast.success('Connected successfully')
    } catch (error) {
      toast.error((error as Error).message)
      ModalStore.close()
    } finally {
      setLoading(false)
      setUri('')
    }
  }

  const initialized = useInitialization()
  useWalletConnectEventsManager(initialized)
  const wallet = useWallet()

  if (!value) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Please log in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Modal />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">WalletConnect</CardTitle>
          <CardDescription>
            Your wallet: {wallet?.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Input value={uri} onChange={(e) => setUri(e.target.value)} />

          <Button onClick={onConnect}>{
            loading ? <Loader2 className="animate-spin" /> : "Connect"
          }</Button>
        </CardContent>
      </Card>
    </>
  )
}