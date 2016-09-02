'use strict'

const p = require('path')

module.exports = {
  'img-url': function (value) {
    const tree = this.context.pluginManager.less.tree

    return new tree.URL(new tree.Quoted('"', p.join('/img', value.value)), this.index, this.currentFileInfo)
  },

  rem: function (value, context) {
    const tree = this.context.pluginManager.less.tree

    if (value.type === 'Expression')
      return new tree.Expression(value.value.map((value) => {
        if (value.unit.backupUnit === 'px')
          return new tree.Dimension(value.value / 14, 'rem')

        return new tree.Dimension(value.value, 'rem')
      }))

    return new tree.Dimension(value.value / 14, 'rem')
  },

  px: function (value) {
    const tree = this.context.pluginManager.less.tree

    if (value.type === 'Expression')
      return new tree.Expression(value.value.map((value) => {
        if (value.unit.backupUnit === 'px')
          return value

        return new tree.Dimension(value.value * 14, 'px')
      }))

    if (value.unit.backupUnit === 'px')
      return value

    return new tree.Dimension(value.value * 14, 'px')
  }
}
