'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageItem({ msg, idx }) {
  return (
    <div className={`message ${msg.role}`} data-testid={`message-${msg.role}-${idx}`}>
      <div className="messageRole" data-testid={`message-role-${idx}`}>
        {msg.role === 'user' ? '' : ''}
      </div>
      <div className="messageContent" data-testid={`message-content-${idx}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children, ...props }) => (
              <table className="markdownTable" {...props}>
                {children}
              </table>
            ),
            thead: ({ children, ...props }) => (
              <thead className="markdownTableHead" {...props}>
                {children}
              </thead>
            ),
            tbody: ({ children, ...props }) => (
              <tbody className="markdownTableBody" {...props}>
                {children}
              </tbody>
            ),
            tr: ({ children, ...props }) => (
              <tr className="markdownTableRow" {...props}>
                {children}
              </tr>
            ),
            th: ({ children, ...props }) => (
              <th className="markdownTableCell markdownTableHeaderCell" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="markdownTableCell" {...props}>
                {children}
              </td>
            ),
          }}
        >
          {msg.content}
        </ReactMarkdown>
      </div>

      {msg.isError && (
        <div className="errorBadge" data-testid={`error-badge-${idx}`}>Error</div>
      )}
    </div>
  );
}
