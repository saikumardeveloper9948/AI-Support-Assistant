import { useEffect, useState, useRef } from "react";
import { Input, Button, Spin, Card, Typography, Space } from "antd";
import { sendMessage, getConversation } from "../services/api";
import MessageBubble from "./MessageBubble";
import { SendOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ChatWindow = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const data = await getConversation(sessionId);
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadConversation();
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      created_at: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(sessionId, input);

      const assistantMessage = {
        role: "assistant",
        content: res.reply,
        created_at: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* Scrollable Messages */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            role={msg.role}
            content={msg.content}
            createdAt={msg.created_at}
          />
        ))}

        {loading && (
          <div className="loading-container">
            <Spin />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="input-container">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="Type your message..."
            className="chat-input"
          />
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            className="send-btn"
          ></Button>
      </div>
    </div>
  );
};

export default ChatWindow;
