"use client";

import * as Dialog from "@radix-ui/react-dialog";

const MAX_WIDTH = {
  xs: "max-w-[420px]",
  sm: "max-w-[560px]",
};

const Modal = ({ open, onOpenChange, title, maxWidth = "sm", children, footer }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/50" />
      <Dialog.Content
        className={`fixed left-1/2 top-1/2 z-[201] max-h-[90vh] w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[rgba(30,27,46,0.08)] bg-white text-text shadow-card-lg ${MAX_WIDTH[maxWidth]}`}
      >
        <Dialog.Title className="border-b border-[rgba(30,27,46,0.07)] px-6 py-4 text-base font-bold text-text">
          {title}
        </Dialog.Title>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pb-5 pt-2">{footer}</div>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default Modal;
