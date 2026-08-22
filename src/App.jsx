import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

import Editor from './components/Editor';

function App() {
  useEffect(() => {
    invoke('initialize_database').catch((error) => {
      console.error('No se pudo inicializar la base de datos SQLite:', error);
    });
  }, []);

  return (
    <div className="App">
      <Editor />
    </div>
  );
}

export default App; 