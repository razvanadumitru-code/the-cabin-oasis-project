import { useState } from 'react';
import { X, Reply, Forward, Archive, Trash2, Star, Paperclip, Send, User, Mail, Calendar, Clock } from 'lucide-react';

export default function EmailModal({
  email,
  isOpen,
  onClose,
  onReply,
  onForward,
  onDelete,
  onArchive,
  onStar,
  currentUserEmail,
}) {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);

  if (!isOpen || !email) return null;

  const buildReplyTemplate = () => {
    return (
      `Dear ${email.fromName},\n\n` +
      `Thank you for reaching out to The Cabin Oasis.\n\n` +
      `Best regards,\n` +
      `Cabin Oasis Team\n\n` +
      `--- Original message ---\n` +
      `${email.content}`
    );
  };

  const buildForwardTemplate = () => {
    return (
      `Forwarded message from ${email.fromName} <${email.from}>:\n\n` +
      `${email.content}`
    );
  };

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(email.id, replyText, {
        to: email.from,
        name: email.fromName,
        subject: `Re: ${email.subject}`,
      });
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleForward = () => {
    if (replyText.trim()) {
      onForward(email.id, replyText);
      setReplyText('');
      setIsForwarding(false);
    }
  };

  const formatEmailDate = (date, time) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - emailDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Today at ${time}`;
    if (diffDays === 1) return `Yesterday at ${time}`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return emailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const conversationHistory = [
    {
      id: `message-${email.id}`,
      sender: email.fromName,
      senderEmail: email.from,
      date: email.date,
      time: email.time,
      subject: email.subject,
      content: email.content,
      isMe: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Mail className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{email.subject}</h3>
              <p className="text-sm text-slate-400">
                {formatEmailDate(email.date, email.time)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onStar(email.id)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title={email.starred ? 'Unstar' : 'Star'}
            >
              <Star size={18} className={email.starred ? 'fill-yellow-500 text-yellow-500' : ''} />
            </button>
            <button 
              onClick={() => onArchive(email.id)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Archive"
            >
              <Archive size={18} />
            </button>
            <button 
              onClick={() => onDelete(email.id)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Sender Info */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-medium text-white">{email.fromName}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    email.category === 'booking' ? 'bg-blue-100 text-blue-800' :
                    email.category === 'inquiry' ? 'bg-purple-100 text-purple-800' :
                    email.category === 'payment' ? 'bg-green-100 text-green-800' :
                    email.category === 'cancellation' ? 'bg-red-100 text-red-800' :
                    email.category === 'system' ? 'bg-yellow-100 text-yellow-800' :
                    email.category === 'marketing' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {email.category}
                  </span>
                  {email.hasAttachment && (
                    <div className="flex items-center gap-1 text-blue-400 text-sm">
                      <Paperclip size={16} />
                      <span>Attachment</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    <span>{email.from}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{email.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{email.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation History */}
          <div className="p-6 space-y-4">
            {conversationHistory.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${
                  message.isMe 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-white'
                } rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{message.sender}</span>
                    <span className={`text-xs ${
                      message.isMe ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {message.date} at {message.time}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Section */}
        <div className="border-t border-slate-700 p-6">
          {!isReplying && !isForwarding ? (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setIsReplying(true);
                  setIsForwarding(false);
                  setReplyText(buildReplyTemplate());
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Reply size={16} />
                Reply
              </button>
              <button 
                onClick={() => {
                  setIsForwarding(true);
                  setIsReplying(false);
                  setReplyText(buildForwardTemplate());
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <Forward size={16} />
                Forward
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1 text-sm text-slate-300">
                <div className="font-medium">
                  {isReplying ? `Reply to ${email.fromName}` : 'Forward this email'}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs text-slate-400">
                  <span>
                    <span className="font-semibold">From:</span>{' '}
                    {currentUserEmail || 'support@cabin-oasis.com'}
                  </span>
                  <span>
                    <span className="font-semibold">To:</span>{' '}
                    {isReplying
                      ? `${email.fromName} <${email.from}>`
                      : 'choose recipient in the next step'}
                  </span>
                </div>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isReplying ? "Type your reply..." : "Add a message to forward..."}
                className="w-full p-3 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <div className="flex gap-2">
                <button 
                  onClick={isReplying ? handleReply : handleForward}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send size={16} />
                  {isReplying ? 'Send Reply' : 'Forward'}
                </button>
                <button 
                  onClick={() => {
                    setIsReplying(false);
                    setIsForwarding(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
