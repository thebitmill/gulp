'use strict'

const p = require('path')

function getValue (obj) {
  if (obj.value) {
    if (obj.value[0]) return getValue(obj.value[0])

    return getValue(obj.value)
  }

  return obj
}

function getVariable (frames) {
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]

    if (frame._variables && frame._variables['@base-font-size']) {
      return getValue(frame._variables['@base-font-size'])
    }
  }

  return undefined
}

module.exports = {
  'img-url': function imgUrl (value) {
    const tree = this.context.pluginManager.less.tree

    return new tree.URL(new tree.Quoted('"', p.join('/img', value.value)), this.index, this.currentFileInfo)
  },

  em (value) {
    const tree = this.context.pluginManager.less.tree

    const baseFontSize = getVariable(this.context.frames)

    if (value.type === 'Expression') {
      return new tree.Expression(value.value.map((v) => {
        if (v.unit.backupUnit === 'px') {
          return new tree.Dimension(v.value / baseFontSize, 'em')
        }

        return new tree.Dimension(v.value, 'em')
      }))
    }

    return new tree.Dimension(value.value / baseFontSize, 'em')
  },

  rem (value) {
    const tree = this.context.pluginManager.less.tree

    const baseFontSize = getVariable(this.context.frames)

    if (value.type === 'Expression') {
      return new tree.Expression(value.value.map((v) => {
        if (v.unit.backupUnit === 'px') {
          return new tree.Dimension(v.value / baseFontSize, 'rem')
        }

        return new tree.Dimension(v.value, 'rem')
      }))
    }

    return new tree.Dimension(value.value / baseFontSize, 'rem')
  },

  px (value) {
    const tree = this.context.pluginManager.less.tree

    const baseFontSize = getVariable(this.context.frames)

    if (value.type === 'Expression') {
      return new tree.Expression(value.value.map((v) => {
        if (v.unit.backupUnit === 'px') {
          return v
        }

        return new tree.Dimension(value.value * baseFontSize, 'px')
      }))
    }

    if (value.unit.backupUnit === 'px') {
      return value
    }

    return new tree.Dimension(value.value * baseFontSize, 'px')
  },
}
