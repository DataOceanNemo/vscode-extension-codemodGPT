import { messageHandler } from "@estruyf/vscode/dist/client";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react";
import * as React from "react";
import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import Markdown from "react-markdown";
import FileTree from "./components/FileTree";
import "./styles.css";
import {
  defaultExcludePatterns,
  defaultPrompt,
  MessageCommands,
  models,
} from "./utils/constants";

export interface IAppProps {}

export const App: FunctionComponent<
  IAppProps
> = ({}: PropsWithChildren<IAppProps>) => {
  // const [message, setMessage] = useState<string>(JSON.stringify(mockData));
  const [message, setMessage] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);

  const [learningResult, setLearningResult] = useState<string>("");
  const [learning, setLearning] = useState<boolean>(false);

  const [codemod, setCodemod] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);

  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [excludePatterns, setExcludePatterns] = useState(
    defaultExcludePatterns.join("\n")
  );
  const [prompt, setPrompt] = useState(defaultPrompt);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLearningResultCollapsed, setIsLearningResultCollapsed] =
    useState(false);
  const [isCodemodCollapsed, setIsCodeModCollapsed] = useState(false);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
    messageHandler.send(MessageCommands.STORE_DATA, {
      selectedModel: e.target.value,
    });
  };

  const handleExcludePatternsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setExcludePatterns(e.target.value);
    messageHandler.send(MessageCommands.STORE_DATA, {
      excludePatterns: e.target.value,
    });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    messageHandler.send(MessageCommands.STORE_DATA, {
      prompt: e.target.value,
    });
  };

  const scan = () => {
    setMessage("");
    setScanning(true);
    messageHandler
      .request<string>(MessageCommands.SCAN, { excludePatterns })
      .then((msg) => {
        setMessage(msg);
        setScanning(false);
      });
  };

  const learn = () => {
    setLearningResult("");
    setLearning(true);
    messageHandler.request<string>(MessageCommands.LEARN).then((msg) => {
      setLearningResult(msg);
      setLearning(false);
    });
  };

  const generate = () => {
    setCodemod("");
    setGenerating(true);
    messageHandler.request<string>(MessageCommands.GENERATE).then((msg) => {
      setCodemod(msg);
      setGenerating(false);
    });
  };

  useEffect(() => {
    messageHandler
      .request<string>(MessageCommands.GET_GLOBAL_STATE)
      .then((msg) => {
        const { selectedModel, excludePatterns, prompt } = JSON.parse(msg);

        selectedModel && setSelectedModel(selectedModel);
        excludePatterns && setExcludePatterns(excludePatterns);
        prompt && setPrompt(prompt);
      });
  }, []);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case MessageCommands.LEARN:
          setLearning(false);
          break;
      }
    });
  }, []);

  return (
    <div className="app">
      <h1>Welcome to codemodGPT</h1>

      <p>
        This vscode extension learns from existing codemod example, and apply
        the same to selected files.
      </p>

      <div className="app__actions">
        <VSCodeButton appearance="primary" onClick={learn} disabled={learning}>
          {learning ? "Learning..." : "Learn from git diff"}
        </VSCodeButton>

        <VSCodeButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          appearance="secondary"
        >
          {isCollapsed ? "Show settings" : "Hide settings"}
        </VSCodeButton>

        {learningResult && (
          <VSCodeButton
            onClick={() =>
              setIsLearningResultCollapsed(!isLearningResultCollapsed)
            }
            appearance="secondary"
          >
            {isLearningResultCollapsed
              ? "Show learning result"
              : "Hide learning result"}
          </VSCodeButton>
        )}
      </div>

      <div className="settings">
        {!isCollapsed && (
          <div className="settings__content">
            <div className="column">
              <div className="settings__field">
                <label
                  htmlFor="model-dropdown"
                  className="settings__field-label"
                >
                  ChatGPT model:
                </label>
                <VSCodeDropdown
                  id="model-dropdown"
                  onChange={handleModelChange}
                  value={selectedModel}
                >
                  {models.map((model) => (
                    <VSCodeOption key={model.value} value={model.value}>
                      {model.label}
                    </VSCodeOption>
                  ))}
                </VSCodeDropdown>
              </div>

              <div className="settings__field">
                <label className="settings__field-label">
                  Scan exclude patterns:
                </label>
                <VSCodeTextArea
                  value={excludePatterns}
                  onChange={handleExcludePatternsChange}
                  rows={10}
                  cols={50}
                  placeholder="Enter exclude patterns, one per line"
                />
              </div>
            </div>

            <div className="template-column">
              <div className="settings__field">
                <label className="settings__field-label">
                  System prompt:
                </label>
                <VSCodeTextArea
                  value={prompt}
                  onChange={handlePromptChange}
                  rows={14}
                  cols={50}
                  placeholder="Enter system prompt"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {learningResult && (
        <>
          {!isLearningResultCollapsed && (
            <>
              <VSCodeDivider />
              <div className="learning-result">
                <Markdown>{learningResult}</Markdown>
              </div>
            </>
          )}

          <VSCodeDivider />

          <div className="app__actions">
            <VSCodeButton
              appearance="primary"
              onClick={generate}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate codemod"}
            </VSCodeButton>

            {codemod && (
              <VSCodeButton
                onClick={() => setIsCodeModCollapsed(!isCodemodCollapsed)}
                appearance="secondary"
              >
                {isCodemodCollapsed
                  ? "Show codemod script"
                  : "Hide codemod script"}
              </VSCodeButton>
            )}
          </div>
        </>
      )}

      {codemod && (
        <>
          {!isCodemodCollapsed && (
            <div className="codemod">
              <Markdown>{codemod}</Markdown>
            </div>
          )}

          <VSCodeDivider />

          <div className="app__actions">
            <VSCodeButton
              appearance="primary"
              onClick={scan}
              disabled={scanning}
            >
              {scanning ? "Scanning..." : "Scan"}
            </VSCodeButton>
          </div>
        </>
      )}

      {message && <FileTree files={JSON.parse(message)} />}
    </div>
  );
};
