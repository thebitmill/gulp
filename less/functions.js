'use strict';

const p = require('path');

function getVariable(frames) {
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    if (frame._variables && frame._variables['@base-font-size'])
      return parseInt(frame._variables['@base-font-size'].value.value[0].value[0].value, 10);
  }
}

module.exports = {
  'img-url': function imgUrl(value) {
    const tree = this.context.pluginManager.less.tree;

    return new tree.URL(new tree.Quoted('"', p.join('/img', value.value)), this.index, this.currentFileInfo);
  },

  rem(value) {
    const tree = this.context.pluginManager.less.tree;

    const baseFontSize = getVariable(this.context.frames);

    if (value.type === 'Expression') {
      return new tree.Expression(value.value.map((v) => {
        if (v.unit.backupUnit === 'px') {
          return new tree.Dimension(v.value / baseFontSize, 'rem');
        }

        return new tree.Dimension(v.value, 'rem');
      }));
    }

    return new tree.Dimension(value.value / baseFontSize, 'rem');
  },

  px(value) {
    const tree = this.context.pluginManager.less.tree;

    if (value.type === 'Expression') {
      return new tree.Expression(value.value.map((v) => {
        if (v.unit.backupUnit === 'px') {
          return v;
        }

        return new tree.Dimension(value.value * baseFontSize, 'px');
      }));
    }

    if (value.unit.backupUnit === 'px') {
      return value;
    }

    return new tree.Dimension(value.value * baseFontSize, 'px');
  },
};
