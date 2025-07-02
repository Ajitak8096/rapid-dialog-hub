import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Smile, LogOut, Users, User, Reply } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface User {
  email: string;
  username: string;
}

interface Contact {
  id: string;
  username: string;
  email: string;
  lastSeen: Date;
  isOnline: boolean;
}

interface ChatInterfaceProps {
  user: User;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout }) => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'me',
      username: user.username,
      email: user.email,
      lastSeen: new Date(),
      isOnline: true
    },
    {
      id: '1',
      username: 'John Doe',
      email: 'john@example.com',
      lastSeen: new Date(),
      isOnline: true
    },
    {
      id: '2',
      username: 'Jane Smith',
      email: 'jane@example.com',
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
      isOnline: false
    },
    {
      id: '3',
      username: 'Mike Johnson',
      email: 'mike@example.com',
      lastSeen: new Date(),
      isOnline: true
    }
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<{[key: string]: Message[]}>({
    'me': [],
    '1': [
      {
        id: '1',
        text: 'Hey there! How are you?',
        sender: 'John Doe',
        timestamp: new Date(Date.now() - 3600000),
        isOwn: false
      }
    ],
    '2': [
      {
        id: '2',
        text: 'Good morning!',
        sender: 'Jane Smith',
        timestamp: new Date(Date.now() - 7200000),
        isOwn: false
      }
    ],
    '3': []
  });

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: replyMode ? selectedContact.username : user.username,
      timestamp: new Date(),
      isOwn: !replyMode
    };

    // If replying as contact, send to current user's chat
    const targetContactId = replyMode ? 'me' : selectedContact.id;
    
    setMessages(prev => ({
      ...prev,
      [targetContactId]: [...(prev[targetContactId] || []), message]
    }));
    
    setNewMessage('');
    setShowEmojiPicker(false);
    
    // If we sent a reply as contact, switch back to viewing our own messages
    if (replyMode) {
      setReplyMode(false);
      const meContact = contacts.find(c => c.id === 'me');
      if (meContact) {
        setSelectedContact(meContact);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const toggleReplyMode = () => {
    setReplyMode(!replyMode);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const currentMessages = selectedContact ? messages[selectedContact.id] || [] : [];

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Contacts Sidebar */}
      <div className="w-80 glass-effect border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">ChatFlow</h1>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h2 className="text-sm font-medium text-muted-foreground mb-2 px-2">Contacts</h2>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                  selectedContact?.id === contact.id ? 'bg-white/20' : ''
                }`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.id === 'me' 
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400' 
                      : 'bg-gradient-to-r from-purple-400 to-pink-400'
                  }`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  {contact.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">
                      {contact.id === 'me' ? `${contact.username} (You)` : contact.username}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {contact.isOnline ? 'online' : formatLastSeen(contact.lastSeen)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {messages[contact.id]?.length > 0 
                      ? messages[contact.id][messages[contact.id].length - 1].text
                      : 'No messages yet'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="glass-effect border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedContact.id === 'me' 
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-400' 
                        : 'bg-gradient-to-r from-purple-400 to-pink-400'
                    }`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    {selectedContact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-900"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium">
                      {selectedContact.id === 'me' ? `${selectedContact.username} (You)` : selectedContact.username}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedContact.isOnline ? 'online' : `last seen ${formatLastSeen(selectedContact.lastSeen)}`}
                    </p>
                  </div>
                </div>
                
                {/* Reply Mode Toggle - only show for other contacts */}
                {selectedContact.id !== 'me' && (
                  <Button
                    onClick={toggleReplyMode}
                    variant={replyMode ? "default" : "ghost"}
                    size="sm"
                    className={`${replyMode ? 'bg-purple-600 hover:bg-purple-700' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    {replyMode ? 'Reply Mode On' : 'Reply as Contact'}
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} animate-slide-in-up`}
                >
                  <div className={`message-bubble ${message.isOwn ? 'message-sent' : 'message-received'}`}>
                    {!message.isOwn && (
                      <div className="text-xs text-purple-300 mb-1 font-medium">
                        {message.sender}
                      </div>
                    )}
                    <div className="break-words">{message.text}</div>
                    <div className={`text-xs mt-1 ${message.isOwn ? 'text-purple-100' : 'text-muted-foreground'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="glass-effect border-t border-white/10 p-4">
              {replyMode && (
                <div className="mb-2 p-2 bg-purple-500/20 rounded-lg text-sm text-purple-200">
                  <Reply className="w-4 h-4 inline mr-1" />
                  Replying as {selectedContact.username}
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={replyMode 
                      ? `Reply as ${selectedContact.username}...` 
                      : `Message ${selectedContact.id === 'me' ? 'yourself' : selectedContact.username}...`
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="glass-effect border-white/20 focus:border-purple-400 pr-12"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8 bg-transparent hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3 transition-all duration-300 hover:scale-105"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                </div>
              )}
            </div>
          </>
        ) : (
          /* No Contact Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2">Welcome to ChatFlow</h3>
              <p className="text-muted-foreground">Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
