import { Verify, SessionTypes } from '@walletconnect/types'
import { proxy } from 'valtio'

const TEST_NETS_ENABLED_KEY = 'TEST_NETS'

/**
 * Types
 */
interface State {
  testNets: boolean
  account: number
  eip155Address: string
  relayerRegionURL: string
  activeChainId: string
  currentRequestVerifyContext?: Verify.Context
  sessions: SessionTypes.Struct[]
}

/**
 * State
 */
const state = proxy<State>({
  testNets:
    typeof localStorage !== 'undefined'
      ? Boolean(localStorage.getItem(TEST_NETS_ENABLED_KEY))
      : true,
  account: 0,
  activeChainId: '1',
  eip155Address: '',
  relayerRegionURL: '',
  sessions: [],
})

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setAccount(value: number) {
    state.account = value
  },

  setEIP155Address(eip155Address: string) {
    state.eip155Address = eip155Address
  },

  setActiveChainId(value: string) {
    state.activeChainId = value
  },

  setCurrentRequestVerifyContext(context: Verify.Context) {
    state.currentRequestVerifyContext = context
  },
  setSessions(sessions: SessionTypes.Struct[]) {
    state.sessions = sessions
  },

  toggleTestNets() {
    state.testNets = !state.testNets
    if (state.testNets) {
      localStorage.setItem(TEST_NETS_ENABLED_KEY, 'YES')
    } else {
      localStorage.removeItem(TEST_NETS_ENABLED_KEY)
    }
  },

}

export default SettingsStore