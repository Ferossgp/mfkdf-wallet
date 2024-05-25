/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useState } from "react";

import ModalStore from "~/store/ModalStore";
import {
  approveEIP155Request,
  getSignParamsMessage,
  rejectEIP155Request,
} from "~/utils/EIP155RequestHandlerUtil";
import { web3wallet } from "~/lib/walletconnect";
import RequestModal from "~/components/RequestModal";
import { toast } from "sonner";
import { useWallet } from "~/hooks/useWallet";
import { bytesToString, Hex, hexToString } from "viem";

export default function SessionSignModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <p>Missing request data</p>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request } = params;

  // TODO: Get message, convert it to UTF8 string if it is valid hex
  const message = hexToString(getSignParamsMessage(request.params));

  const wallet = useWallet();

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent && wallet) {
      setIsLoadingApprove(true);
      const response = await approveEIP155Request(wallet, requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        setIsLoadingApprove(false);
        toast((e as Error).message);
        return;
      }
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, topic, wallet]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        setIsLoadingReject(false);
        toast((e as Error).message);
        return;
      }
      setIsLoadingReject(false);
      ModalStore.close();
    }
  }, [requestEvent, topic]);

  return (
    <RequestModal
      intention="request a signature"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      <div>
        <div>
          <h5>Message</h5>
          <p>{message}</p>
        </div>
      </div>
    </RequestModal>
  );
}
