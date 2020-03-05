const { Router } = require('express')
const TestModel = require('^models/Test')

const Test = new TestModel()

class TestController {
  constructor () {
    this.path = '/test'
    this.router = Router()
    this.initializeRoutes()
  }

  initializeRoutes () {
    this.router.get(this.path, this.getAbout)
  }

  async getAbout (req, res) {
    const test = await Test.hello()
    res.send(test)
  }
}

module.exports = TestController
