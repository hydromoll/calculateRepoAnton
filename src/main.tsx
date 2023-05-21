import React from 'react'
import ReactDOM from 'react-dom/client'
import {App3} from './App'
import './samples/node-api'
import './index.scss'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App3 />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
