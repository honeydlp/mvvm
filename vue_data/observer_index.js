/* 源码目录 src/core/observer/index.js */
/*
  在本段代码中，代码<1>处，对传入的数据对象进行了判断，只对对象和数组类型生成Observer实例,然后看Observer这个类的代码，
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  //检测当前数据是否被observe过,如果是则不必重复绑定
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    //<1>检测当前的数据是否是对象或者数组，如果是，则生成对应的Observer
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
 }