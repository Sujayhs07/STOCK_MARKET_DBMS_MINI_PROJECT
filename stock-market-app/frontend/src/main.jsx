import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0d1226',
          color: '#e2e8f0',
          border: '1px solid #1a2235',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        },
        success: { iconTheme: { primary: '#00e676', secondary: '#0d1226' } },
        error: { iconTheme: { primary: '#ff3d5a', secondary: '#0d1226' } },
      }}
    />
  </React.StrictMode>,
)
