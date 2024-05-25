import { useCallback, useMemo, useState } from 'react'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { SignClientTypes } from '@walletconnect/types'
import ModalStore from '~/store/ModalStore'
import { useSnapshot } from 'valtio'
import SettingsStore from '~/store/SettingsStore'
import { toast } from 'sonner'
import RequestModal from '~/components/RequestModal'
import { web3wallet } from '~/lib/walletconnect'
import { EIP155_SIGNING_METHODS } from '~/hooks/useWalletConnectEventsManager'
import { useWallet } from '~/hooks/useWallet'

export const EIP155_CHAINS = {
  'eip155:1': {
    chainId: 1,
    name: 'Ethereum',
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: 'https://cloudflare-eth.com/',
    namespace: 'eip155'
  },
}

export default function SessionProposalModal() {
  // Get proposal data and wallet address from store
  const data = useSnapshot(ModalStore.state)
  const proposal = data?.data?.proposal as SignClientTypes.EventArguments['session_proposal']
  const [isLoadingApprove, setIsLoadingApprove] = useState(false)
  const [isLoadingReject, setIsLoadingReject] = useState(false)

  const wallet = useWallet()

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = Object.keys(EIP155_CHAINS)
    const eip155Methods = Object.values(EIP155_SIGNING_METHODS)

    return {
      eip155: {
        chains: eip155Chains,
        methods: eip155Methods,
        events: ['accountsChanged', 'chainChanged'],
        accounts: eip155Chains.map(chain => `${chain}:${wallet?.address}`).flat()
      },
    }
  }, [wallet])

  const namespaces = useMemo(() => {
    try {
      // the builder throws an exception if required namespaces are not supported
      return buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces
      })
    } catch (e) { }
  }, [proposal.params, supportedNamespaces])


  // Hanlde approve action, construct session namespace
  const onApprove = useCallback(async () => {
    if (proposal && namespaces) {
      setIsLoadingApprove(true)
      try {
        await web3wallet.approveSession({
          id: proposal.id,
          namespaces,
        })
        SettingsStore.setSessions(Object.values(web3wallet.getActiveSessions()))
      } catch (e) {
        setIsLoadingApprove(false)
        toast.error((e as Error).message)
        return
      }
    }
    setIsLoadingApprove(false)
    ModalStore.close()
  }, [namespaces, proposal])

  // Hanlde reject action
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onReject = useCallback(async () => {
    if (proposal) {
      try {
        setIsLoadingReject(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS')
        })
      } catch (e) {
        setIsLoadingReject(false)
        toast.error((e as Error).message)
        return
      }
    }
    setIsLoadingReject(false)
    ModalStore.close()
  }, [proposal])

  return (
    <RequestModal
      metadata={proposal.params.proposer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
      infoBoxText={`The session cannot be approved because the wallet does not the support some or all of the proposed chains. Please inspect the console for more information.`}
    >
      <h1>Connect to dApp</h1>
    </RequestModal>
  )
}
