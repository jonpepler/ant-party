import React from 'react'
import PropTypes from 'prop-types'

const ErrorMessage = (props) => {
  return (<div className='error error--large'>{props.message}</div>)
}

export default ErrorMessage

ErrorMessage.propTypes = {
  message: PropTypes.string
}
