import { Fragment, ReactNode, useMemo } from 'react'
import { CoreTypes } from '@walletconnect/types'

import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

export interface LoaderProps {
  active?: boolean
}

interface IProps {
  children: ReactNode
  metadata: CoreTypes.Metadata
  onApprove: () => void
  onReject: () => void
  intention?: string
  infoBoxCondition?: boolean
  infoBoxText?: string
  approveLoader?: LoaderProps
  rejectLoader?: LoaderProps
  disableApprove?: boolean
  disableReject?: boolean
}

export default function RequestModal({
  children,
  metadata,
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  intention,
  disableApprove,
  disableReject
}: IProps) {
  const modalContent = useMemo(() => {
    return (
      <>
        <div title="">
          <h1>{metadata.name}</h1>
          <p>{intention}</p>
          {children}
        </div>
        <div>
          <Button onClick={onReject} disabled={disableReject}>
            {rejectLoader && rejectLoader.active ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Reject'
            )}
          </Button>
          <Button onClick={onApprove} disabled={disableApprove}>
            {approveLoader && approveLoader.active ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Approve'
            )}</Button>
        </div>
      </>
    )
  }, [approveLoader, children, intention, metadata, onApprove, onReject, rejectLoader, disableApprove, disableReject])
  return <Fragment>{modalContent}</Fragment>
}
