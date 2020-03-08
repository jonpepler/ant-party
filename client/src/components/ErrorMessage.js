import React from 'react'

const ErrorMessage = (props) => {
  return (<div className="error error--large">{props.message}</div>)
}

export default ErrorMessage;