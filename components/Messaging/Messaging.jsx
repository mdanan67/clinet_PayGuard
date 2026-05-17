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
  const messagesEndRef = useRef(null);

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
        const alreadyExists = currentMessages.some((message) => message.id === newMessage.id);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversationId]);

  const handleSelectContact = (contact) => {
    const conversation = conversations.find((item) => item.otherUser?.id === contact.id);

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
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col bg-slate-50">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <div>
          {/* <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Family Chat
          </p> */}
          {/* <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
            Talk with your linked accounts
          </h1> */}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              connectionStatus === 'Connected'
                ? 'bg-emerald-500'
                : connectionStatus === 'Reconnecting'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
          />
          <span className="text-xs font-bold text-slate-600">{connectionStatus}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-6 lg:mx-8">
          {errorMessage}
        </div>
      )}

      <div className="grid min-h-0 flex-1 overflow-hidden bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">Contacts</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {contacts.length} linked {contacts.length === 1 ? 'contact' : 'contacts'}
                </p>
              </div>
              <button
                type="button"
                onClick={loadContactsAndConversations}
                disabled={loadingContacts}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingContacts ? 'Loading' : 'Refresh'}
              </button>
            </div>
          </div>

          {loadingContacts ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="grid flex-1 place-items-center px-5 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                  0
                </div>
                <p className="mt-3 text-sm font-bold text-slate-800">No contacts yet</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Linked parent or child accounts will show up here.
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-1.5">
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
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition ${
                        isActive ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                        }`}
                      >
                        {getInitial(contact.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-sm font-bold text-slate-950">
                            {contact.name || 'User'}
                          </p>
                          <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                            {formatTime(conversation?.lastMessage?.sentAt)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs font-medium text-slate-500">
                          {conversation?.lastMessage?.body || contact.email || contact.role}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        <section className="flex min-h-0 flex-col bg-slate-50">
          <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3">
            {selectedContact ? (
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {getInitial(selectedContact.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-slate-950">
                    {selectedContact.name || 'User'}
                  </h2>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {selectedContact.email || selectedContact.role}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-base font-bold text-slate-950">Select a contact</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Choose someone to open the conversation.
                </p>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-5">
            {!selectedContact ? (
              <div className="grid h-full place-items-center text-center">
                <div className="max-w-sm">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl font-bold text-indigo-600 shadow-sm">
                    M
                  </div>
                  <p className="mt-4 text-base font-bold text-slate-800">
                    Your conversations live here
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Select a contact from the left panel to read and send messages.
                  </p>
                </div>
              </div>
            ) : loadingMessages ? (
              <div className="space-y-3">
                <div className="h-12 w-52 rounded-2xl rounded-bl-md bg-white shadow-sm" />
                <div className="ml-auto h-12 w-64 rounded-2xl rounded-br-md bg-indigo-100" />
                <div className="h-12 w-44 rounded-2xl rounded-bl-md bg-white shadow-sm" />
              </div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div className="max-w-sm">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-50 text-base font-bold text-indigo-600">
                    {getInitial(selectedContact.name)}
                  </div>
                  <p className="mt-4 text-base font-bold text-slate-800">Start a conversation</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Send a message to {selectedContact.name || 'this contact'}.
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
                        className={`max-w-[min(72%,680px)] rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMine
                            ? 'rounded-br-md bg-indigo-600 text-white shadow-indigo-100'
                            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {message.body}
                        </p>
                        <p
                          className={`mt-1 text-right text-[11px] font-semibold ${
                            isMine ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {formatTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-end gap-3">
              <textarea
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSendMessage(event);
                  }
                }}
                placeholder="Write a message..."
                disabled={!selectedContact || sending}
                rows={1}
                className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!selectedContact || sending || !messageBody.trim()}
                className="h-12 shrink-0 cursor-pointer rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm shadow-indigo-100 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
