"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Layout, Typography, message, TabsProps, Tabs } from "antd";
import { Config, LogCustom } from "./types";
import {
  createConfigValue,
  createDefaultValue,
  decompressData,
  initializer,
  loadStateFromStorage,
  updateStateInStorage,
} from "./utils/storage";
import { useSearchParams } from "next/navigation";
import LogEditor from "./components/LogEdtior";

const { Title } = Typography;
const { Content } = Layout;

const Main = () => {
  const loadURL = useSearchParams().get("style");

  // State 관리
  const [isClient, setIsClient] = useState(false);
  const [inputText, setInputText] = useState<string>("");

  const [activeTab, setActiveTab] = useState(loadURL ? "4" : "1");

  useEffect(() => {
    setIsClient(true);
    const savedState = loadStateFromStorage();
    if (savedState) {
      if (savedState.logCustom) {
        setLogCustom(
          initializer(
            savedState.logCustom as unknown as Record<string, unknown>,
            {
              character: createDefaultValue(),
              persona: createDefaultValue(),
              logCustom: false,
            } as unknown as Record<string, unknown>
          ) as unknown as LogCustom
        );
      }
      if (savedState.config) {
        setConfig(
          initializer(
            savedState.config as unknown as Record<string, unknown>,
            createConfigValue() as unknown as Record<string, unknown>
          ) as unknown as Config
        );
      }
    }
  }, []); // 초기 상태 로드

  useEffect(() => {
    if (loadURL == null) return;
    const sharedState = decompressData(loadURL);
    if (sharedState && sharedState.logCustom) {
      setSharedLogCustom(
        initializer(
          sharedState.logCustom as unknown as Record<string, unknown>,
          {
            character: createDefaultValue(),
            persona: createDefaultValue(),
          } as unknown as Record<string, unknown>
        ) as unknown as LogCustom
      );
    }
  }, [loadURL]);

  const [logCustom, setLogCustom] = useState<LogCustom>({
    character: createDefaultValue(),
    persona: createDefaultValue(),
    personaUseCharacterCustom: true,
  });

  const [sharedLogCustom, setSharedLogCustom] = useState<LogCustom>({
    character: createDefaultValue(),
    persona: createDefaultValue(),
    personaUseCharacterCustom: true,
  });

  // Configuration 관련 state 추가
  const [config, setConfig] = useState<Config>(createConfigValue());

  // logCustom 상태 변경 핸들러
  const handleLogCustomChange = (newLogCustom: LogCustom) => {
    setLogCustom(newLogCustom);
    updateStateInStorage("logCustom", newLogCustom);
  };

  // config 상태 변경 핸들러
  const handleConfigChange = (key: keyof Config, value: string | boolean) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        [key]: value,
      };
      updateStateInStorage("config", newConfig);
      return newConfig;
    });
  };

  // 클립보드에 복사
  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("HTML이 클립보드에 복사되었습니다.");
    } catch {
      message.error("복사 중 오류가 발생했습니다.");
    }
  };

  const tabs: TabsProps["items"] = [
    {
      key: "1",
      label: "로그 제조기",
      children: (
        <>
          <Title level={2}>로그 제조기</Title>
          <LogEditor
            inputText={inputText}
            config={config}
            logCustom={logCustom}
            handleLogCustomChange={handleLogCustomChange}
            onInputChange={(text) => setInputText(text)}
            onConfigChange={handleConfigChange}
            onCopyToClipboard={copyToClipboard}
          />
        </>
      ),
    },
    {
      key: "4",
      label: "공유 받은 스타일",
      children: (
        <>
          <Title level={2}>공유 받은 스타일</Title>
          <LogEditor
            inputText={inputText}
            config={config}
            logCustom={sharedLogCustom}
            handleLogCustomChange={(newLogCustom) =>
              setSharedLogCustom(newLogCustom)
            }
            onInputChange={(text) => setInputText(text)}
            onConfigChange={handleConfigChange}
            onCopyToClipboard={copyToClipboard}
            overwriteStyle={() => handleLogCustomChange(sharedLogCustom)}
          />
        </>
      ),
    },
  ];

  return (
    <>
      {isClient && (
        <Content>
          <Tabs
            defaultActiveKey="1"
            items={tabs}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
          />
        </Content>
      )}
    </>
  );
};

const LogGenerator: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh", padding: "24px" }}>
      <Suspense>
        <Main />
      </Suspense>
    </Layout>
  );
};

export default LogGenerator;
