import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Layout } from "antd";
import HeaderBar from "./Components/HeaderBar";
import ChatWindow from "./Components/ChatWindow";
import "antd/dist/reset.css";
import "./App.css";

const { Content } = Layout;

function getInitialSession() {
  const existing = localStorage.getItem("sessionId");
  if (existing) return existing;

  const newId = uuidv4();
  localStorage.setItem("sessionId", newId);
  return newId;
}

function App() {
  const [sessionId, setSessionId] = useState(getInitialSession);

  return (
    <Layout className="app-layout">
      <HeaderBar setSessionId={setSessionId} />
      <Content className="app-content">
        <ChatWindow sessionId={sessionId} />
      </Content>
    </Layout>
  );
}

export default App;