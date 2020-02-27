/* eslint-disable no-unused-expressions */

// Import the dependencies for testing
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'

// Configure chai
chai.use(chaiHttp)
chai.should()
const TestModel = require('^models/Test')

const Test = new TestModel()

describe('Test Model', () => {
  it('should return hello world', async () => {
    const hello = await Test.hello()
    expect(hello).to.not.be.undefined
  })
})
