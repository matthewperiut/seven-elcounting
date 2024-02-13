import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const signup = async () => {

  }
  const login = async () => {
      
  }
  const logout = async () => {
      
  }
  return (
    <>
        <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Seven-Elcounting</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div name="main">
      <h1 id="header">Seven-Elcounting</h1>
      <form action="">
        <div name="login">
          <input
            type="text"
            name="username"
            id="username"
            required
            placeholder="Username"
          />
        </div>
        <div name="login">
          <input
            type="text"
            name="password"
            id="password"
            required
            placeholder="Password"
          />
        </div>
        <div>
          <a href="#">Forgot password?</a>
        </div>
        <button>Login</button>
        <div>
            <a href="#">Create an account!</a>
        </div>
      </form>
    </div>
  </body>
    </>
  )
}

export default App
