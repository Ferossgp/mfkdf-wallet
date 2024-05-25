import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { Hex, isAddress, PrivateKeyAccount } from 'viem'
import { EIP155_SIGNING_METHODS } from '~/hooks/useWalletConnectEventsManager'
import SettingsStore from '~/store/SettingsStore'

type RequestEventArgs = Omit<SignClientTypes.EventArguments['session_request'], 'verifyContext'>

export function getSignParamsMessage(params: string[]) {
  const message = params.filter(p => !isAddress(p))[0]

  return message as Hex
}

export async function approveEIP155Request(wallet: PrivateKeyAccount, requestEvent: RequestEventArgs) {
  const { params, id } = requestEvent
  const { chainId, request } = params

  SettingsStore.setActiveChainId(chainId)

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      try {
        const signedMessage = await wallet.signMessage({ message: { raw: getSignParamsMessage(request.params) } })
        return formatJsonRpcResult(id, signedMessage)
      } catch (error: any) {
        console.error(error)
        return formatJsonRpcError(id, error.message)
      }
    default:
      throw new Error(getSdkError('INVALID_METHOD').message)
  }
}

export function rejectEIP155Request(request: RequestEventArgs) {
  const { id } = request

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message)
}
