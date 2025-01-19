import React, { useState } from "react";
import Header from "./components/Header";
import "./App.css";
import { open } from '@tauri-apps/plugin-dialog';
import { writeFile, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [logs, setLogs] = useState("");

  const handleFileChange = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] }]
      });

      if (selected) {
        setSelectedFiles(selected);
        await copyFilesToInputFolder(selected);
      }
    } catch (error) {
      console.error("Error in handleFileChange:", error);
      setLogs(`Error: ${error.message}`);
    }
  };

  const copyFilesToInputFolder = async (files) => {
    try {
      // Ensure the input-folder exists
      await mkdir('input-folder', { dir: BaseDirectory.App, recursive: true });

      for (const file of files) {
        const response = await fetch(file);
        const buffer = await response.arrayBuffer();
        const fileName = file.split('/').pop();
        const filePath = await join(BaseDirectory.App, 'input-folder', fileName);
        await writeFile(filePath, new Uint8Array(buffer));
      }

      setLogs("Files copied successfully.");
    } catch (error) {
      console.error("Error in copyFilesToInputFolder:", error);
      setLogs(`Error: ${error.message}`);
    }
  };

  return (
    <main className="container">
      <Header />
      <div>
        <button onClick={handleFileChange}>Select Images</button>
        <div>
          <h3>Logs</h3>
          <textarea value={logs} readOnly rows="10" cols="50" />
        </div>
      </div>
    </main>
  );
}

export default App;
