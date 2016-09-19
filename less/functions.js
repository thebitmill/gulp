'use strict';

const p = require('path');

module.exports = {
  'img-url': function imgUrl(value) {
    const tree = this.context.pluginManager.less.tree;

    return new tree.URL(new tree.Quoted('"', p.join('/img', value.value)), this.index, this.currentFileInfo);
  },

  rem(value) {
    const tree = this.context.pluginManager.less.tree;

    if (value.type === 'Expression') {
      return new tree.Expression(value.value.map((v) => {
        if (v.unit.backupUnit === 'px') {
          return new tree.Dimension(v.value / 14, 'rem');
        }

        return new tree.Dimension(v.value, 'rem');
      }));
    }

    return new tree.Dimension(value.value / 14, 'rem');
  },

  px(value) {
    const tree = this.context.pluginManager.less.tree;

    if (value.type === 'Expression') {
      return new tree.Expression(value.value.map((v) => {
        if (v.unit.backupUnit === 'px') {
          return v;
        }

        return new tree.Dimension(value.value * 14, 'px');
      }));
    }

    if (value.unit.backupUnit === 'px') {
      return value;
    }

    return new tree.Dimension(value.value * 14, 'px');
  },
};
