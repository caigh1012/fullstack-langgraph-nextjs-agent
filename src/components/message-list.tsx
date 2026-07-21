import { nanoid } from 'nanoid';
import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Message {
  key: string;
  content: string;
  role: 'user' | 'assistant';
}

const messageList: Message[] = [
  {
    content: 'Hello, how are you?',
    key: nanoid(),
    role: 'user',
  },
  {
    content: "I'm good, thank you! How can I assist you today?",
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: "I'm looking for information about your services.",
    key: nanoid(),
    role: 'user',
  },
  {
    content: 'Sure! We offer a variety of AI solutions. What are you interested in?',
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: "I'm interested in natural language processing tools.",
    key: nanoid(),
    role: 'user',
  },
  {
    content: 'Great choice! We have several NLP APIs. Would you like a demo?',
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: 'Yes, a demo would be helpful.',
    key: nanoid(),
    role: 'user',
  },
  {
    content: 'Alright, I can show you a sentiment analysis example. Ready?',
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: 'Yes, please proceed.',
    key: nanoid(),
    role: 'user',
  },
  {
    content: "Here is a sample: 'I love this product!' → Positive sentiment.",
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: 'Impressive! Can it handle multiple languages?',
    key: nanoid(),
    role: 'user',
  },
  {
    content: 'Absolutely, our models support over 20 languages.',
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: 'How do I get started with the API?',
    key: nanoid(),
    role: 'user',
  },
  {
    content: 'You can sign up on our website and get an API key instantly.',
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: 'Is there a free trial available?',
    key: nanoid(),
    role: 'user',
  },
  {
    content: 'Yes, we offer a 14-day free trial with full access.',
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: 'What kind of support do you provide?',
    key: nanoid(),
    role: 'user',
  },
  {
    content: 'We provide 24/7 chat and email support for all users.',
    key: nanoid(),
    role: 'assistant',
  },
  {
    content: 'Thank you for the information!',
    key: nanoid(),
    role: 'user',
  },
  {
    content: "You're welcome! Let me know if you have any more questions.",
    key: nanoid(),
    role: 'assistant',
  },
];

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <>
      {messages.map(({ key, content, role }) => (
        <Message
          from={role}
          key={key}>
          <div className="flex items-start gap-2">
            {role === 'assistant' && (
              <Avatar className="shrink-0">
                <AvatarImage src="/logo.svg" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
            <MessageContent>{content}</MessageContent>
            {role === 'user' && (
              <Avatar className="shrink-0">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
          </div>
        </Message>
      ))}
    </>
  );
}
