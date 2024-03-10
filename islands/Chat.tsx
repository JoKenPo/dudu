import type { Signal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import { Message } from "@/lib/chatml.ts";
import Button from "@/components/Button.tsx";
import ChatBubble from "@/components/ChatBubble.tsx";

interface ChatProps {
  chatID: Signal<string>;
}

export default function Chat(props: ChatProps) {
  const [webSocket, setWebSocket] = useState<any>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string>("dudu:pt");
  const [connected, setConnected] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [messageSent, setMessageSent] = useState<boolean>(false);

  useEffect(() => {
    console.log(`connecting to /api/chat/ws/${props.chatID.value}...`);
    const ws = new WebSocket(
      `ws://${location.host}/api/chat/ws/${props.chatID.value}`,
    );

    setWebSocket(ws)

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      if (message.type === "init") {
        setModel(message.model);
        return;
      }
console.log('message: ',message);
      setMessages((messages) => [...messages, message]);
      setMessageSent(false);
    });

    // return () => ws.close();
  }, [connected]);

    // Função para enviar uma mensagem através do WebSocket
    const sendMessage = () => {
      if (!messageInput.trim()) return; // Ignora mensagens vazias
      const newMessage: Message = {
        role: "user",
        content: messageInput,
        id: Math.random().toString(), // Gere um ID único para a mensagem
      };
      webSocket.send(JSON.stringify({ prompt: messageInput }));
      setMessageInput(''); // Limpa o campo de entrada de mensagem
      setMessageSent(true);
      setMessages((messages) => [...messages, newMessage]);
    };

  return (
    <div className="m-4">
      <h1 class="text-4xl font-bold">Dudu</h1>
      <p class="my-4">
        Model: <code>{model}</code>
      </p>
      <p class="my-4">
        Chat ID: <code>{props.chatID.value}</code>
      </p>

      <Button
        onClick={() => {
          console.log("clicked");
          setConnected(!connected);
          setMessages([{
            role: "user",
            content: "Bem vindo",
            id: "1",
          }]);
        }}
      >
        Connect
      </Button>

      {messages.map((message: Message) => (
        <ChatBubble
          id={message.id}
          bg={message.role === "assistant" ? "green-300" : "blue-300"}
          reply={message.role === "assistant"}
        >
          <span dangerouslySetInnerHTML={{ __html: message.content }} />
        </ChatBubble>
      ))}
      
      {/* Input e botão para enviar mensagens */}
      <div className="overflow-hidden [&:has(textarea:focus)]:border-token-border-xheavy [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex flex-col w-full flex-grow relative border dark:text-white rounded-2xl bg-token-main-surface-primary border-token-border-medium">
        <textarea
          className="m-0 w-full resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 dark:bg-transparent py-[10px] pr-10 md:py-3.5 md:pr-12 max-h-[25dvh] max-h-52 placeholder-black/50 dark:placeholder-white/50 pl-3 md:pl-4"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Digite sua mensagem"
          disabled={messageSent}
        />
        <button
        className="absolute bottom-1.5 right-2 rounded-lg border border-black bg-black p-0.5 text-white transition-colors enabled:bg-black disabled:text-gray-400 disabled:opacity-10 dark:border-white dark:bg-white dark:hover:bg-white md:bottom-3 md:right-3"
        onClick={sendMessage}
        disabled={messageSent}>Enviar</button
      ></div>
    </div>
  );
}
