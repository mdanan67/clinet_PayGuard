'use client';

import axios from 'axios';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';
const MESSAGING_API_URL = `${API_BASE_URL}/api/Messaging`;

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.response?.data?.title ||
  error.response?.data?.detail ||
  error.message ||
  fallback;

const formatTime = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const getInitial = (name) => name?.trim()?.charAt(0)?.toUpperCase() || 'U';

const Messaging = () => {
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  const connectionRef = useRef(null);
  const selectedConversationIdRef = useRef('');

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const loadContactsAndConversations = useCallback(async () => {
    try {
      setLoadingContacts(true);
      setErrorMessage('');

      const [contactsResponse, conversationsResponse] = await Promise.all([
        axios.get(`${MESSAGING_API_URL}/contacts`, { withCredentials: true }),
        axios.get(`${MESSAGING_API_URL}/conversations`, { withCredentials: true }),
      ]);

      const nextContacts = contactsResponse.data?.contacts || [];
      const nextConversations = conversationsResponse.data?.conversations || [];

      setContacts(nextContacts);
      setConversations(nextConversations);

      if (!selectedContact && nextContacts.length > 0) {
        const firstContact = nextContacts[0];
        const firstConversation = nextConversations.find(
          (conversation) => conversation.otherUser?.id === firstContact.id
        );

        setSelectedContact(firstContact);
        setSelectedConversationId(firstConversation?.id || '');
      }
    } catch (error) {
      console.error('Messaging load error:', error);
      setErrorMessage(getErrorMessage(error, 'Failed to load messaging data.'));
    } finally {
      setLoadingContacts(false);
    }
  }, [selectedContact]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      setErrorMessage('');

      const response = await axios.get(
        `${MESSAGING_API_URL}/conversations/${conversationId}/messages`,
        { withCredentials: true }
      );

      setMessages(response.data?.messages || []);
    } catch (error) {
      console.error('Message load error:', error);
      setErrorMessage(getErrorMessage(error, 'Failed to load messages.'));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/messaging`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('ReceiveMessage', (newMessage) => {
      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.id === newMessage.conversationId
            ? {
                ...conversation,
                lastMessage: newMessage,
              }
            : conversation
        )
      );

      if (selectedConversationIdRef.current !== newMessage.conversationId) {
        return;
      }

      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) => message.id === newMessage.id
        );

        if (alreadyExists) return currentMessages;

        return [...currentMessages, newMessage];
      });
    });

    connection.onreconnecting(() => setConnectionStatus('Reconnecting'));
    connection.onreconnected(() => setConnectionStatus('Connected'));
    connection.onclose(() => setConnectionStatus('Disconnected'));

    const startConnection = async () => {
      try {
        await connection.start();
        connectionRef.current = connection;
        setConnectionStatus('Connected');
      } catch (error) {
        console.error('SignalR connection error:', error);
        setConnectionStatus('Disconnected');
      }
    };

    startConnection();

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const joinConversation = async () => {
      if (!selectedConversationId || !connectionRef.current) return;

      try {
        await connectionRef.current.invoke('JoinConversation', selectedConversationId);
      } catch (error) {
        console.error('Join conversation error:', error);
      }
    };

    joinConversation();
  }, [selectedConversationId]);

  useEffect(() => {
    loadContactsAndConversations();
  }, [loadContactsAndConversations]);

  useEffect(() => {
    loadMessages(selectedConversationId);
  }, [loadMessages, selectedConversationId]);

  const handleSelectContact = (contact) => {
    const conversation = conversations.find(
      (item) => item.otherUser?.id === contact.id
    );

    setSelectedContact(contact);
    setSelectedConversationId(conversation?.id || '');
    setMessages([]);
    setErrorMessage('');
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedContact) {
      setErrorMessage('Please select a contact first.');
      return;
    }

    if (!messageBody.trim()) {
      setErrorMessage('Please write a message.');
      return;
    }

    try {
      setSending(true);
      setErrorMessage('');

      const response = await axios.post(
        `${MESSAGING_API_URL}/send`,
        {
          receiverUserId: selectedContact.id,
          body: messageBody.trim(),
        },
        { withCredentials: true }
      );

      const conversationId = response.data?.data?.conversationId;
      const shouldReloadMessages =
        !selectedConversationId ||
        (conversationId && conversationId !== selectedConversationId) ||
        !connectionRef.current ||
        connectionStatus !== 'Connected';

      setMessageBody('');
      setSelectedConversationId(conversationId || selectedConversationId);
      await loadContactsAndConversations();

      if (shouldReloadMessages) {
        await loadMessages(conversationId || selectedConversationId);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setErrorMessage(getErrorMessage(error, 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] bg-slate-50 p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-500">
            Chat with your linked parent or children.
          </p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {connectionStatus}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid min-h-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">Contacts</h2>
            <button
              type="button"
              onClick={loadContactsAndConversations}
              disabled={loadingContacts}
              className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingContacts ? 'Loading' : 'Refresh'}
            </button>
          </div>

          {loadingContacts ? (
            <div className="p-4 text-sm font-medium text-slate-500">
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-sm font-medium text-slate-500">
              No linked contacts found.
            </div>
          ) : (
            <div className="max-h-[620px] overflow-y-auto p-2">
              {contacts.map((contact) => {
                const conversation = conversations.find(
                  (item) => item.otherUser?.id === contact.id
                );
                const isActive = selectedContact?.id === contact.id;

                return (
                  <button
                    type="button"
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                      isActive
                        ? 'bg-blue-50 ring-1 ring-blue-100'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {getInitial(contact.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {contact.name || 'User'}
                        </p>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                          {formatTime(conversation?.lastMessage?.sentAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                        {conversation?.lastMessage?.body || contact.email || contact.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="flex min-h-[680px] flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            {selectedContact ? (
              <>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {getInitial(selectedContact.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-slate-900">
                    {selectedContact.name || 'User'}
                  </h2>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {selectedContact.email || selectedContact.role}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-base font-bold text-slate-900">Select a contact</h2>
                <p className="text-xs font-medium text-slate-500">
                  Choose someone from the left side to start messaging.
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5">
            {!selectedContact ? (
              <div className="grid h-full place-items-center text-sm font-medium text-slate-500">
                No conversation selected.
              </div>
            ) : loadingMessages ? (
              <div className="text-sm font-medium text-slate-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">No messages yet</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Send the first message to start this conversation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isMine = message.senderUserId !== selectedContact.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                          isMine
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {message.body}
                        </p>
                        <p
                          className={`mt-1 text-right text-[11px] font-medium ${
                            isMine ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {formatTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-slate-100 bg-white p-4">
            <div className="flex gap-3">
              <textarea
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Write a message..."
                disabled={!selectedContact || sending}
                rows={2}
                className="min-h-12 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={!selectedContact || sending || !messageBody.trim()}
                className="h-12 shrink-0 cursor-pointer rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Messaging;
