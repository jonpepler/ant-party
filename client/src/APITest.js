import React, { useState } from 'react'

const APITest = () => {
  const [apiResponse, setAPIResponse] = useState('')

  const callAPI = () => {
    fetch(`${process.env.REACT_APP_SERVER_HOST}/api/v1/test`)
      .then(res => res.text())
      .then(res => setAPIResponse(res))
  }
  if (apiResponse === '') callAPI()

  return (<p>{apiResponse}</p>)
}

export default APITest;