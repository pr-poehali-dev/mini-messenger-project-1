import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  isRegistered: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isMine: boolean;
}

const mockChats: Chat[] = [
  { id: 1, name: 'Алексей', avatar: '', lastMessage: 'Давай встретимся завтра', time: '15:30', unread: 2, online: true },
  { id: 2, name: 'Мария', avatar: '', lastMessage: 'Спасибо за помощь!', time: '14:20', unread: 0, online: true },
  { id: 3, name: 'Дмитрий', avatar: '', lastMessage: 'Отправил файлы', time: '13:15', unread: 1, online: false },
  { id: 4, name: 'Анна', avatar: '', lastMessage: 'Как дела?', time: 'Вчера', unread: 0, online: false },
  { id: 5, name: 'Сергей', avatar: '', lastMessage: 'Созвонимся вечером', time: 'Вчера', unread: 0, online: true },
];

const mockMessages: Message[] = [
  { id: 1, text: 'Привет! Как дела?', time: '15:20', isMine: false },
  { id: 2, text: 'Привет! Все отлично, спасибо', time: '15:22', isMine: true },
  { id: 3, text: 'Давай встретимся завтра', time: '15:30', isMine: false },
];

function Index() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsPermission, setContactsPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const requestContactsAccess = async () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const contactsList = await (navigator as any).contacts.select(props, opts);
        
        const formattedContacts: Contact[] = contactsList.map((contact: any, index: number) => ({
          id: Date.now() + index,
          name: contact.name?.[0] || 'Без имени',
          phone: contact.tel?.[0] || '',
          avatar: '',
          isRegistered: Math.random() > 0.3
        }));
        
        setContacts(formattedContacts);
        setContactsPermission('granted');
      } catch (error) {
        setContactsPermission('denied');
      }
    } else {
      const mockContacts: Contact[] = [
        { id: 101, name: 'Иван Петров', phone: '+7 999 123 45 67', avatar: '', isRegistered: true },
        { id: 102, name: 'Елена Сидорова', phone: '+7 999 234 56 78', avatar: '', isRegistered: true },
        { id: 103, name: 'Михаил Кузнецов', phone: '+7 999 345 67 89', avatar: '', isRegistered: false },
        { id: 104, name: 'Ольга Смирнова', phone: '+7 999 456 78 90', avatar: '', isRegistered: true },
        { id: 105, name: 'Владимир Попов', phone: '+7 999 567 89 01', avatar: '', isRegistered: true },
      ];
      setContacts(mockContacts);
      setContactsPermission('granted');
    }
  };

  const startNewChat = (contact: Contact) => {
    const existingChat = chats.find(chat => chat.name === contact.name);
    
    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      const newChat: Chat = {
        id: Date.now(),
        name: contact.name,
        avatar: contact.avatar,
        lastMessage: 'Начните переписку',
        time: 'Сейчас',
        unread: 0,
        online: contact.isRegistered
      };
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      setMessages([]);
    }
    
    setShowNewChat(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Чаты</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewChat(true)}
                className="hover:bg-card"
              >
                <Icon name="UserPlus" size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(true)}
                className="hover:bg-card"
              >
                <Icon name="User" size={20} />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-3 rounded-lg mb-1 text-left transition-all hover:bg-card ${
                  selectedChat?.id === chat.id ? 'bg-card' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {chat.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{chat.name}</span>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedChat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedChat.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.online ? 'в сети' : 'не в сети'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVideoCall(true)}
                  className="hover:bg-background"
                >
                  <Icon name="Video" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-background">
                  <Icon name="Phone" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-background">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${
                        message.isMine
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-card-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">{message.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-card">
                  <Icon name="Paperclip" size={20} />
                </Button>
                <Input
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-card border-border"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon name="MessageSquare" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Выберите чат для начала общения</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  Я
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Мой профиль</h3>
                <p className="text-sm text-muted-foreground">в сети</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer transition-colors">
                <Icon name="User" size={20} className="text-muted-foreground" />
                <span className="text-sm">Редактировать профиль</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer transition-colors">
                <Icon name="Settings" size={20} className="text-muted-foreground" />
                <span className="text-sm">Настройки</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer transition-colors">
                <Icon name="Bell" size={20} className="text-muted-foreground" />
                <span className="text-sm">Уведомления</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer transition-colors">
                <Icon name="Lock" size={20} className="text-muted-foreground" />
                <span className="text-sm">Приватность</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Новый чат</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {contactsPermission === 'prompt' && (
              <div className="text-center py-8">
                <Icon name="Contacts" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Доступ к контактам</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Разрешите доступ к контактам, чтобы найти друзей
                </p>
                <Button onClick={requestContactsAccess} className="bg-primary hover:bg-primary/90">
                  <Icon name="UserCheck" size={18} className="mr-2" />
                  Разрешить доступ
                </Button>
              </div>
            )}
            
            {contactsPermission === 'granted' && (
              <>
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск контактов..."
                    className="pl-10 bg-background border-border"
                  />
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-1">
                    {contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => contact.isRegistered && startNewChat(contact)}
                        disabled={!contact.isRegistered}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          contact.isRegistered 
                            ? 'hover:bg-background cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {contact.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.phone}</p>
                          </div>
                          {contact.isRegistered ? (
                            <Badge className="bg-green-500 text-white">В приложении</Badge>
                          ) : (
                            <Button size="sm" variant="outline" className="text-xs">
                              Пригласить
                            </Button>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoCall} onOpenChange={setShowVideoCall}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle>Видеозвонок с {selectedChat?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-background rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="w-32 h-32">
                  <AvatarFallback className="bg-primary text-primary-foreground text-5xl">
                    {selectedChat?.name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-muted rounded-lg border-2 border-border overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      Я
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
                <Icon name="Mic" size={20} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
                <Icon name="Video" size={20} />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => setShowVideoCall(false)}
              >
                <Icon name="PhoneOff" size={20} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
                <Icon name="MonitorUp" size={20} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Index;