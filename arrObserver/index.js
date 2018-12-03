const mutationMethods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

const hasProto = '__proto__' in {}
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

function defineReactive(obj, key) {
  const dep = []

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && !property.configurable) {
    return
  }

  const getter = property && property.get
  const setter = property && property.set

  let value = obj[key]
  observe(value)
  Object.defineProperty(obj, key, {
    get () {
      getter && (value = getter.call(obj))
      dep.push(target)
      return value
    },
    set (newVal) {
      getter && (value = getter.call(obj))
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        value = newVal
      }
      observe(newVal)
      dep.forEach(f => {
        f()
      })
    }
  })
}

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
mutationMethods.forEach(method => {
  arrayMethods[method] = function (...args) {
    const result = arrayProto[method].apply(this, args)
    console.log(`我截获了对数组的${method}操作`)
    return result
  }
})

function observe(value) {
  if (Array.isArray(value) || isPlainObject(value)) {
    return new Observer(value)
  }
}

class Observer {
  constructor (value) {
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, mutationMethods)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

function protoAugment(target, src) {
  target.__proto__ = src
}
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

function myWatch(exp, fn) {
  target = fn
  if (typeof exp === 'function') {
    exp()
    return
  }
  let pathArr,
      obj = data
  if (/\./.test(exp)) {
    pathArr = exp.split('.')
    pathArr.forEach(p => {
      target = fn
      obj = obj[p]
    })
    return
  }
  data[exp]
}

const data = {
  name: 'kobe bryant',
  otherInfo: {
    height: 198,
    numbers: [8, 24]
  },
  teammates: [
    'paul gasol',
    {
      name: 'shaq',
      numbers: [32, 34, 33]
    }
  ]
}

function render() {
  document.body.innerText = `我最喜欢的NBA球员是${data.name}，他身高${data.otherInfo.height}cm，穿过${data.otherInfo.numbers.length}个球衣号码，${data.otherInfo.numbers[0]}和${data.otherInfo.numbers[1]}，他的队友有${data.teammates[0]}和${data.teammates[1].name}，其中，${data.teammates[1].name}在湖人时期穿的球衣号码为${data.teammates[1].numbers[1]}号`
}

observe(data)
myWatch(render, render)

data.name = 'michael'
data.otherInfo.height = 198.1
data.otherInfo.numbers.push(23)
data.teammates[1].name = 'scott pippen'
data.teammates[1].numbers.push(33)