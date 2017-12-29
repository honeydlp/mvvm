/* 源码目录 src/core/observer/watcher.js */
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
 /* watcher用来解析表达式，收集依赖，并且当表达式的值改变时触发回调函数 
 用在$watch() api 和指令中
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: ISet;
  newDepIds: ISet;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) {
    this.vm = vm
    vm._watchers.push(this)
    // options
    //这里暂时不用关注 
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    //deps和newDeps表示现有的依赖和新一轮收集的依赖
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    //<1>解析getter的表达式 
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      //<2>获取实际对象的值
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    //this.lazy为true是计算属性的watcher，另外处理，其他情况调用get
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      //<3>清除先前的依赖
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
   /* 给当前指令添加依赖 */
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
   /* 清除旧依赖 */
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
   /* 订阅者的接口 当依赖改变时会触发 */
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
   /* 调度接口 调度时会触发 */
  run () {
    if (this.active) {
      //<14>重新收集依赖
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }

/**
 * 首先看官方文档的英文注释可知，watcher用于watcher用来解析表达式，收集依赖，并且当表达式的值改变时触发回调函数，用在$watch()api 和指令之中。

watcher函数主要内容是：

初始化属性的值，其中和本文相关的主要是deps、newDeps、depIds、newDepIds,分别表示现有依赖和新一轮收集的依赖，这里的依赖就是前文介绍的数据对应的dep。
设置getter属性。<1>判断传入的表达式类型：可能是函数，也可能是表达式。如果是函数，那么直接设置成getter，如果是表达式，由于代码<2>处的expOrFn只是字符串，比如例子1中的obj.key，在这里仅仅是一个字符串，所以要用parsePath获取到实际的值
执行get()方法，在这里主要做收集依赖，并且获取数据的值，之后要调用代码<3>`cleanupDeps`清除旧的依赖。这是必须要做的，因为数据更新之后可能有新的数据属性添加进来，前一轮的依赖中没有包含这个新数据，所以要重新收集。
update方法主要内容是里面的触发更新之后会触发run方法（虽然这里分了三种情况，但是最终都是触发run方法），而run方法调用get()首先重新收集依赖，然后使用this.cb.call更新模板或者表达式的值。
总结
在最后，我们再总结一下这个流程：首先数据从初始化data开始，使用observe监控数据：给每个数据属性添加dep，并且在它的getter过程添加收集依赖操作，在setter过程添加通知更新的操作；在解析指令或者给vue实例设置watch选项或者调用$watch时，生成对应的watcher并收集依赖。之后，如果数据触发更新，会通知watcher，wacther在重新收集依赖之后，触发模板视图更新。这就完成了数据响应式的流程。

本文的流程图根据源码的过程画出，而在官方文档的流程图中，没有单独列出dep和obvserver，因为这个流程最核心的思路就是将data的属性转化成getter和setter然后和watcher绑定。

然后依然是惯例：如果这篇文章对你有帮助，希望可以收藏和推荐，以上内容属于个人见解，如果有不同意见，欢迎指出和探讨。请尊重作者的版权，转载请注明出处，如作商用，请与作者联系，感谢！
 */
