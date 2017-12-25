function DataBinder(object_id){
  //创建一个简单地PubSub对象   

  var pubSub = {
      callbacks: {},

      on: function(msg,callback){
          this.callbacks[msg] = this.callbacks[msg] || [];
          this.callbacks[msg].push(callback);
      },

      publish: function(msg){
          this.callbacks[msg] = this.callbacks[msg] || [];
          for(var i = 0, len = this.callbacks[msg].length; i<len; i++){
              this.callbacks[msg][i].apply(this,arguments);
          }
      }
  },

  data_attr = "data-bind-" + object_id,
  message = object_id + ":change",

  changeHandler = function(evt){
      var target = evt.target || evt.srcElemnt, //IE8兼容
          prop_name = target.getAttribute(data_attr);

          if(prop_name && prop_name !== ""){
              pubSub.publish(message,prop_name,target.value);
          }
  };

  //监听变化事件并代理到PubSub 
  if(document.addEventListener){
      document.addEventListener("change",changeHandler,false);
  }else{
      //IE8使用attachEvent而不是addEventListener     
      document.attachEvent("onchange",changeHandler);
  }

  //PubSub将变化传播到所有绑定元素    

  pubSub.on(message,function(vet,prop_name,new_val){
      var elements = document.querySelectorAll("[" + data_attr + "=" + prop_name + "]"),
          tag_name;

      for(var i = 0,len =elements.length; i < len; i++){
          tag_name = elements[i].tagName.toLowerCase();

          if(tag_name === "input" || tag_name === "textarea" || tag_name === "select"){
              elements[i].value = new_val;
          }else{
              elements[i].innerHTML = new_val;
          }
      }
  });

  return pubSub;
}