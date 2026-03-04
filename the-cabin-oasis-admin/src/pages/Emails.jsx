import { useState, useEffect } from 'react';
import { Search, Mail, Send, Archive, Trash2, Star, Filter, Reply, Forward } from 'lucide-react';
import EmailModal from '../components/EmailModal';
import api from '../api';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Emails() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // State for compose functionality
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages/');
      const messagesData = response.data.map(message => ({
        ...message,
        id: message.message_id,
        from: message.email || message.to || '',
        fromName: message.name || message.email || message.to || 'Unknown sender',
        subject: message.subject,
        preview: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content,
        content: message.content,
        date: new Date(message.created_at).toLocaleDateString(),
        time: new Date(message.created_at).toLocaleTimeString(),
        read: message.is_read,
        starred: false,
        category: 'inquiry',
        hasAttachment: false
      }));
      console.log('Fetched messages:', messagesData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Email templates
  const emailTemplates = {
    confirmation: {
      subject: 'Booking Confirmation - {cabinName}',
      content: 'Dear {guestName},\n\nThank you for your booking at Cabin Oasis!\n\nYour reservation details:\n- Cabin: {cabinName}\n- Check-in: {checkInDate} at 3:00 PM\n- Check-out: {checkOutDate} at 11:00 AM\n- Guests: {guestCount}\n- Total Amount: ${totalAmount}\n\nWe are excited to welcome you to our beautiful cabin retreat. Please arrive at your check-in time. If you have any questions or special requests, feel free to contact us.\n\nSafe travels!\nCabin Oasis Team'
    },
    thanks: {
      subject: 'Thank You for Staying at Cabin Oasis',
      content: 'Dear {guestName},\n\nThank you for choosing Cabin Oasis for your recent stay!\n\nWe hope you had a wonderful time at {cabinName}. Your feedback is important to us - please take a moment to rate your experience and leave a review.\n\nWe look forward to welcoming you back soon!\n\nBest regards,\nCabin Oasis Team'
    }
  };

  // Filter emails based on search and category
  const filteredEmails = messages.filter(email => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      email.subject.toLowerCase().includes(searchLower) ||
      email.from.toLowerCase().includes(searchLower) ||
      email.fromName.toLowerCase().includes(searchLower) ||
      email.preview.toLowerCase().includes(searchLower);
    
    const matchesFilter = selectedFilter === 'all' || email.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading messages...</div>
      </div>
    );
  }

  const handleSelectEmail = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id));
    }
  };

  const getCategoryBadge = (category) => {
    const styles = {
      booking: 'bg-blue-100 text-blue-800',
      inquiry: 'bg-purple-100 text-purple-800',
      payment: 'bg-green-100 text-green-800',
      system: 'bg-yellow-100 text-yellow-800',
      cancellation: 'bg-red-100 text-red-800',
      marketing: 'bg-indigo-100 text-indigo-800'
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmail(null);
  };

  const handleReply = (emailId, replyText, metadata) => {
    const original = messages.find((m) => m.id === emailId);
    if (!original) return;

    const recipientEmail = metadata?.to || original.from || original.email || '';
    const replySubject = metadata?.subject || `Re: ${metadata?.originalSubject || original.subject}`;

    // Open compose modal with prefilled fields so admin can see/edit To/Subject
    setSelectedTemplate('');
    setComposeData({
      to: recipientEmail,
      subject: replySubject,
      content: replyText,
    });
    setIsComposeModalOpen(true);
    setIsModalOpen(false);
  };

  const handleForward = (emailId, forwardText) => {
    const original = messages.find((m) => m.id === emailId);
    if (!original) return;

    // Pre-fill compose modal for forwarding, admin can choose recipient
    setSelectedTemplate('');
    setComposeData({
      to: '',
      subject: `Fwd: ${original.subject}`,
      content:
        (forwardText ? forwardText + '\n\n' : '') +
        `--- Forwarded message from ${original.fromName} <${original.from}> ---\n\n${original.content}`,
    });
    setIsComposeModalOpen(true);
    setIsModalOpen(false);
  };

  const handleDelete = (emailId) => {
    console.log('Delete email:', emailId);
    // Mock delete functionality
    alert('Email deleted successfully!');
    handleCloseModal();
  };

  const handleArchive = (emailId) => {
    console.log('Archive email:', emailId);
    // Mock archive functionality
    alert('Email archived successfully!');
    handleCloseModal();
  };

  const handleStar = (emailId) => {
    console.log('Star email:', emailId);
    // Mock star functionality
    alert('Email starred successfully!');
  };

  // Compose functions
  const handleComposeClick = () => {
    setIsComposeModalOpen(true);
  };

  const handleCloseComposeModal = () => {
    setIsComposeModalOpen(false);
    setSelectedTemplate('');
    setComposeData({
      to: '',
      subject: '',
      content: ''
    });
  };

  const handleTemplateSelect = (templateType) => {
    setSelectedTemplate(templateType);
    const template = emailTemplates[templateType];
    
    setComposeData({
      to: '',
      subject: template.subject,
      content: template.content
    });
  };

  const handleComposeDataChange = (field, value) => {
    setComposeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      to: composeData.to,
      subject: composeData.subject,
      content: composeData.content,
    };

    try {
      await api.post('/messages/send', payload);
      alert('Email sent successfully via Mailtrap');
      handleCloseComposeModal();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Emails</h2>
          <p className="text-slate-400">Manage your email communications</p>
        </div>
        <button 
          onClick={handleComposeClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Send size={20} />
          Compose
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search emails by subject, sender, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="booking">Bookings</option>
              <option value="inquiry">Inquiries</option>
              <option value="payment">Payments</option>
              <option value="cancellation">Cancellations</option>
              <option value="system">System</option>
              <option value="marketing">Marketing</option>
            </select>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Filter size={20} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Email Actions */}
      {selectedEmails.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {selectedEmails.length} {selectedEmails.length === 1 ? 'email' : 'emails'} selected
          </span>
          <div className="flex gap-2">
            <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Archive size={18} />
            </button>
            <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
            <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Star size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email) => (
                  <tr 
                    key={email.id} 
                    className={`hover:bg-slate-700 cursor-pointer ${!email.read ? 'bg-slate-700/30' : ''}`}
                    onClick={() => handleEmailClick(email)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectEmail(email.id);
                        }}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Mail size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{email.fromName}</p>
                          <p className="text-xs text-slate-400">{email.from}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white font-medium">{email.subject}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{email.preview}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadge(email.category)}`}>
                        {email.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">
                        <p>{email.date}</p>
                        <p className="text-xs text-slate-500">{email.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {email.hasAttachment && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has attachment"></div>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle reply action
                          }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                        >
                          <Reply size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle forward action
                          }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                        >
                          <Forward size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete action
                          }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Mail size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No emails found</p>
                    <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Modal */}
      <EmailModal
        email={selectedEmail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReply={handleReply}
        onForward={handleForward}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onStar={handleStar}
        currentUserEmail={user?.email}
      />

      {/* Compose Modal */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold">Compose Email</h3>
              <button
                onClick={handleCloseComposeModal}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {/* Template Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Choose a Template</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTemplateSelect('confirmation')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedTemplate === 'confirmation'
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-left">
                      <h5 className="font-semibold text-white mb-2">📅 Booking Confirmation</h5>
                      <p className="text-sm text-slate-400">Send confirmation emails to new guests with booking details</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('thanks')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedTemplate === 'thanks'
                        ? 'border-green-500 bg-green-600/20'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-left">
                      <h5 className="font-semibold text-white mb-2">🙏 Thank You After Stay</h5>
                      <p className="text-sm text-slate-400">Send thank you emails to guests after their stay</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Email Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    To
                  </label>
                  <input
                    type="email"
                    value={composeData.to}
                    onChange={(e) => handleComposeDataChange('to', e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => handleComposeDataChange('subject', e.target.value)}
                    placeholder="Email subject"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => handleComposeDataChange('content', e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                    rows={12}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleCloseComposeModal}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send size={16} />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
