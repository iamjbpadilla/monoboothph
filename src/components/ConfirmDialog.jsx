import * as Dialog from '@radix-ui/react-dialog';

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="rounded-2xl bg-md-surface-container p-6 shadow-2xl border border-md-outline-variant">
            <Dialog.Title className="text-lg font-semibold text-md-on-surface mb-2">{title}</Dialog.Title>
            <Dialog.Description className="text-sm text-md-on-surface-variant mb-6">{description}</Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2.5 rounded-full text-sm font-medium text-md-primary hover:bg-md-primary/10 transition-colors">
                  {cancelText}
                </button>
              </Dialog.Close>
              <button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className="px-4 py-2.5 rounded-full text-sm font-medium bg-md-primary text-md-on-primary hover:brightness-110 transition-colors"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
