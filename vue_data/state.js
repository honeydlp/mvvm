 /* 源码目录 src/core/instance/state.js */
 /*这一段代码主要做2件事：

代码<1>在while循环内调用proxy函数把data的属性代理到vue实例上。完成之后可以通过vm.key直接访问data.key。
之后对data调用了observe方法，在这里说明一下，如果是在实例化之前添加的数据，因为被observe过，所以会变成响应式数据，而在实例化之后使用vm.newKey = newVal这样设置新属性，是不会自动响应的。解决方法是：

- 如果你知道你会在晚些时候需要一个属性，但是一开始它为空或不存在，那么你仅需要设置一些初始值

- 使用`vm.$data`等一些api进行数据操作*/

 function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components. html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      //<1>data属性代理
      proxy(vm, `_data`, key)
    }
  }
  // observe data
   //对data调用observe
  observe(data, true /* asRootData */)
}