const { version } = require('../package.json')

class Test {
  async hello () {
    return `Ant Party Server ${version}`
  }
}

module.exports = Test
