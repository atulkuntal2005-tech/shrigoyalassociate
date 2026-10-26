import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove standalone file:// fallback stylesheet once React hydrates over HTTP/HTTPS
const standaloneStyle = document.getElementById('standalone-fallback-styles');
if (standaloneStyle) {
  standaloneStyle.remove();
}

createRoot(document.getElementById('root')!).render(<App />);
