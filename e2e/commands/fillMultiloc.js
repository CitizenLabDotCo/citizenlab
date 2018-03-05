const util = require('util');
const events = require('events');

function FillMultiloc() {
  events.EventEmitter.call(this);
}

util.inherits(FillMultiloc, events.EventEmitter);

FillMultiloc.prototype.command = function fillCommand(wrapperSelector, value) {
  this.api.waitForElementVisible(wrapperSelector)
  .elements('css selector', `${wrapperSelector} input, ${wrapperSelector} textarea, ${wrapperSelector} .public-DraftEditor-content`, (result) => {
    result.value.forEach((elementId) => {
      this.api.elementIdValue(elementId.ELEMENT, value);
    });
  });

  setTimeout(() => {
    this.emit('complete');
  }, 1000);
  return this;
};

module.exports = FillMultiloc;
