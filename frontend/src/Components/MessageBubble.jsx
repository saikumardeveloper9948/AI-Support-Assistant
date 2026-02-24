import { Card, Avatar, Typography } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const MessageBubble = ({ role, content, createdAt }) => {
  const isUser = role === "user";

  return (
  <div
    style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 14,
    }}
  >
    <Card
  styles={{
    body: {
      background: isUser ? "#2563EB" : "#334155",
      color: "#E2E8F0",
      padding: "12px 16px",
      borderRadius: isUser
        ? "20px 20px 6px 20px"   // user bubble style
        : "20px 20px 20px 6px",  // assistant bubble style
    },
  }}
  style={{
    maxWidth: "70%",
    border: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  }}
>
      <div>{content}</div>
      <small style={{ opacity: 0.6 }}>
        {dayjs(createdAt).format("HH:mm")}
      </small>
    </Card>
  </div>
);
};

export default MessageBubble;
