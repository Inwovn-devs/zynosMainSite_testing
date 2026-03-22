import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App';
import './index.css';

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#e63946',
    colorBgBase: '#0a0a0a',
    colorBgContainer: '#111111',
    colorBgElevated: '#1a1a1a',
    borderRadius: 8,
    fontFamily: 'Inter, sans-serif',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>
          <ConfigProvider theme={darkTheme}>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #2a2a2a',
                },
              }}
            />
          </ConfigProvider>
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
