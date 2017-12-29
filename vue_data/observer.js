/**
 * 在Observer类代码中，首先给当前数据添加了一个dep实例，存放于对象或者数组类型数据的_![图片描述][2]ob_属性上，然后把_ob_挂在该数据上，它是该数据项被observe的标志，我们可以在控制台看到这个属性，,例如：
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    this.value = value
    // 生成了一个消息订阅器dep实例 关于dep的结构稍后详细介绍 
    this.dep = new Dep()
    this.vmCount = 0
    //def函数给当前数据添加不可枚举的__ob__属性，表示该数据已经被observe过
    def(value, '__ob__', this)
    //<1>对数组类型的数据 调用observeArray方法；对对象类型的数据，调用walk方法
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
   /* 循环遍历数据对象的每个属性，调用defineReactive方法 只对Object类型数据有效 */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  /**
   * Observe a list of Array items. 
   */
   /* observe数组类型数据的每个值， */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

/* defineReactive的核心思想改写数据的getter和setter */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  //<2>生成一个dep实例，注意此处的dep和前文Observer类里直接添加的dep的区别
  const dep = new Dep()
    
  //检验该属性是否允许重新定义setter和getter
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 获取原有的 getter/setters
  const getter = property && property.get
  const setter = property && property.set
  
  //<3>此处对val进行了observe
  let childOb = !shallow && observe(val)
  
  //<4>下面的代码利用Object.defineProperty函数把数据转化成getter和setter，并且在getter和setter时，进行了一些操作
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        // dep.depend()其实就是dep和watcher进行了互相绑定，而Dep.target表示需要绑定的那个watcher，任何时刻都最多只有一个，后面还会解释
        dep.depend()
        if (childOb) {
          //<5>当前对象的子对象的依赖也要被收集
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      //<6>观察新的val并通知订阅者们属性有更新
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}