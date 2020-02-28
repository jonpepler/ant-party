const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 32 });

class Func {
  constructor (untrustedCode) {
    this.context = isolate.createContextSync();
    const jail = this.context.global;
    jail.setSync('global', jail.derefInto());
    const logCallback = function(...args) {
      console.log(...args);
    };
    this.context.evalClosureSync(`global.log = function(...args) {
      $0.applyIgnored(undefined, args, { arguments: { copy: true } });
    }`, [ logCallback ], { arguments: { reference: true } });

    try{
      this.code = isolate.compileScriptSync(untrustedCode);
    }
    catch (e) { throw e }
  }

  async run () {
    return this.code.run(this.context)
  }
}

module.exports = Func
