'use client';

export default function DeleteChatModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" data-testid="delete-chat-modal">
      <div className="deleteModalPopover" role="dialog" aria-labelledby="delete-chat-title">
        <header className="deleteModalHeader">
          <div className="deleteModalHeaderTitle">
            <h2 id="delete-chat-title" className="deleteModalTitle">Delete chat?</h2>
          </div>
        </header>
        <div className="deleteModalBody">
          This will delete the messages in this conversation.
          <div className="deleteModalActions">
            <button
              onClick={onConfirm}
              className="btn btnDanger"
              data-testid="delete-conversation-confirm-button"
              type="button"
            >
              Delete
            </button>
            <button
              onClick={onCancel}
              className="btn btnSecondary"
              data-testid="delete-conversation-cancel-button"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
