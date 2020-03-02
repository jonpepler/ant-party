import React from 'react';

export default class APITEST extends React.Component {
  constructor() {
    super();
    this.state = { apiResponse: "" };
    this.callAPI();
  }

  callAPI() {
    fetch(`${process.env.REACT_APP_SERVER_HOST}/api/v1/test`)
      .then(res => res.text())
      .then(res => this.setState({ apiResponse: res }));
  }

  render () {
    return (<p>{this.state.apiResponse}</p>)
  }
}