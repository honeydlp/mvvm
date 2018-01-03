/**
 * angular脏检查机制的实现
 */
window.onload = function(){
  'use strict';
  var scope = {
    increaseSprite:function(){
      this.sprite++;
    },
    decreaseSprite:function(){
      this.sprite--;
    },
    increaseCola:function(){
      this.cola++;
    },
    decreaseCola:function(){
      this.cola--;
    },
    cola:0,
    sprite:0,
    price:5
  }

  function Scope(){
    this.$$watchList = [];
  }

  Scope.prototype.$watch = function (name,getNewValue,listener){
    var watch = {
      name:name,
      getNewValue:getNewValue,
      listener:listener || function(){}
    }
    this.$$watchList.push(watch);
  }

  Scope.prototype.$digest = function () {
    var dirty = true;
    var checkTime = 0;
    while(dirty){
      dirty = false ;
      var list = this.$$watchList;
      for(var i=0,len=list.length;i<len;i++){
        var watch = list[i];
        console.log(watch);
        var newValue = watch.getNewValue(watch.name);
        var oldValue = watch.last;
        if(newValue!== oldValue){
          watch.listener(newValue,oldValue);
          dirty = true;
        }else{
          scope[watch.name] = newValue;
        }
        watch.last = newValue;
      }
      checkTime++;
      if(checkTime>10&&dirty){
        throw new Error('检测超过了10次了');
      }
    }
  }
  
  var $scope = new Scope();
  $scope.$watch('sprite',
                function(){
                  $scope.sprite=scope.sprite;
                  return $scope[this.name];
                },
                function(newValue,oldValue){
                  console.log(newValue,oldValue)
                }
  );
  $scope.$watch('cola',
                function(){
                  $scope.cola=scope.cola;
                  return $scope[this.name];
                },
                function(newValue,oldValue){
                  console.log(newValue,oldValue)
                }
  ); 
  $scope.$watch('sum',
                function(){
                  $scope.sum=scope.cola*scope.price+scope.sprite*scope.price;
                  return $scope[this.name];
                },
                function(newValue,oldValue){
                  console.log(newValue,oldValue)
                }
  );   

  function bind(){
    var list = document.querySelectorAll('[ng-click]');
    for(var i=0,len=list.length;i<len;i++){
      list[i].onclick = (function(index){
        return function(){
          var func=this.getAttribute('ng-click');
          scope[func]();
          apply();
        }
      })(i)
    }
  }

  function apply(){
    $scope.$digest();
    var list = document.querySelectorAll('[ng-bind]');
    for(var i=0,len=list.length;i<len;i++){
      var bindData = list[i].getAttribute('ng-bind');
      list[i].innerHTML = scope[bindData];
    }
  }

  bind();
  apply();
}