const { VM, VMScript } = require('vm2')

class Func {
  constructor (untrustedCode, ant) {
    const sandbox = { ant }
    this.vm = new VM({ sandbox })
    this.script = new VMScript(untrustedCode)
  }

  async run () {
    return this.vm.run(this.script)
  }
}

module.exports = Func
