import ModalStore from '~/store/ModalStore'
import SessionProposalModal from './SessionProposalModal'
import SessionRequestModal from './SessionSignModal'
import { useSnapshot } from 'valtio'
import { useCallback, useMemo } from 'react'
import { Dialog, DialogContent } from '~/components/ui/dialog'

export default function Modal() {
  const { open, view } = useSnapshot(ModalStore.state)
  // handle the modal being closed by click outside
  const onClose = useCallback(() => {
    if (open) {
      ModalStore.close()
    }
  }, [open])

  console.log('view', open, view)
  const componentView = useMemo(() => {
    switch (view) {
      case 'SessionProposalModal':
        return <SessionProposalModal />
      case 'SessionSignModal':
        return <SessionRequestModal />
      default:
        return null
    }
  }, [view])

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} >
      <DialogContent>
        {componentView}
      </DialogContent>
    </Dialog>
  )
}
