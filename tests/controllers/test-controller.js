/* eslint-disable no-unused-expressions */

// Import the dependencies for testing
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import { app } from '../../index'

// Configure chai
chai.use(chaiHttp)
chai.should()

describe('Test Controller', () => {
  describe('GET /api/v1/test/', () => {
    it('should return hello world', (done) => {
      chai.request(app)
        .get('/api/v1/test')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          done()
        })
    })
  })
})
