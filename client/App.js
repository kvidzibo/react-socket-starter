import React, { useState, useEffect } from 'react'
import io from './io'

const App = () => {
  const [date, setDate] = useState('Loading...')
  const setDateFromServer = () => {
    io.emit('get:date', date => setDate(date))
  }
  useEffect(setDateFromServer, [])
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">{date}</h1>
        <button className="button" onClick={setDateFromServer}>Update Date From Server</button>
      </div>
    </section>
  )
}

export default App
