const { Router } = require('express')
const Func = require('^models/Func')

class FuncController {
  constructor () {
    this.path = 
    this.router = Router()

    this.router.post('/run', this.run)
  }

  async run (req, res, next) {
    if (req.query.func === undefined) {
      const error = new Error('missing function')
      error.httpStatusCode = 400
      return next(error)
    }
    const code = req.query.func
    try {
      const func = new Func(code)
      const result = await func.run()
      res.send({result})
    }
    catch (e) {
      const error = new Error(e)
      error.httpStatusCode = 400
      next(error)
    }
  }
}

module.exports = FuncController
