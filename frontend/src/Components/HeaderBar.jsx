import { Button, Layout, Typography } from "antd";
import { v4 as uuidv4 } from "uuid";

const { Header } = Layout;
const { Title } = Typography;

const HeaderBar = ({ setSessionId }) => {
  const handleNewChat = () => {
    const newId = uuidv4();
    localStorage.setItem("sessionId", newId);
    setSessionId(newId);
  };
return (
  <div
    style={{
      padding: "16px 24px",
      background: "#626d7f",
      color: "#e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #334155",
    }}
  >
    <h3 style={{ margin: 0 }}>AI Support Assistant</h3>

    <Button type="primary" onClick={handleNewChat}>
      New Chat
    </Button>
  </div>
);
};

export default HeaderBar;