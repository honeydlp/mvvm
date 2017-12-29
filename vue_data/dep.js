/* 源码目录 src/core/observer/dep.js */
/**
 * 这个类相对简单很多，只有2个属性:第一个是id，在每个vue实例中都从0开始计数；另一个是subs数组，用于存放wacther，根绝前文我们知道，一个数据对应一个Dep，所以subs里存放的也就是依赖该数据需要绑定的wacther。

这里有个Dep.target属性是全局共享的，表示当前在收集依赖的那个Watcher，在每个时刻最多只会有一个。
 */
let uid = 0
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }
  //添加一个watcher
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  //移除一个watcher
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  //让当前watcher收集依赖 同时Dep.target.addDep也会触发当前dep收集watcher
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
 //通知watcher们对应的数据有更新
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
