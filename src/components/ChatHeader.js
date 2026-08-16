'use client';

import Image from 'next/image';
import assetConfig from '@/config/assets.json';

export default function ChatHeader({ onAvatarClick, onDeleteClick }) {
  return (
    <div className="chatHeader" data-testid="chat-header">
      <Image
        src={assetConfig.header.bubuImage}
        alt="Bubu"
        className="headerImage"
        width={70}
        height={70}
        data-testid="chat-header-image"
        onClick={onAvatarClick}
        style={{ cursor: 'pointer' }}
      />
      <h1 data-testid="chat-title">Custom AI Chat</h1>
      <button
        onClick={onDeleteClick}
        className="deleteToggleButton"
        title="Delete Chat"
        data-testid="delete-chat-button"
        type="button"
      >
        <Image
          src={assetConfig.header.trashIcon}
          alt="Delete Chat"
          width={60}
          height={60}
        />
      </button>
    </div>
  );
}
