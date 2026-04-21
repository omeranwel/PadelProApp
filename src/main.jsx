import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111118', color: '#F0F0FF', border: '1px solid #2A2A3E', borderRadius: '12px', fontSize: '14px' } }} />
    </QueryClientProvider>
  </React.StrictMode>,
)
