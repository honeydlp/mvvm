function DataBinder(object_id){
  //使用一个jQuery对象作为简单的订阅者发布者
  var pubSub = jQuery({});

  //我们希望一个data元素可以在表单中指明绑定：data-bind-<object_id>="<property_name>"        

  var data_attr = "bind-" + object_id,
          message = object_id + ":change";

  //使用data-binding属性和代理来监听那个元素上的变化事件
  // 以便变化能够“广播”到所有的关联对象   

  jQuery(document).on("change","[data-" + data_attr + "]",function(evt){
      var input = jQuery(this);
      pubSub.trigger(message, [input.data(data_attr),input.val()]);
  });

  //PubSub将变化传播到所有的绑定元素，设置input标签的值或者其他标签的HTML内容   

  pubSub.on(message,function(evt,prop_name,new_val){
      jQuery("[data-" + data_attr + "=" + prop_name + "]").each(function(){
      var $bound = jQuery(this);

      if($bound.is("input,text area,select")){
          $bound.val(new_val);
      }else{
          $bound.html(new_val);
      }
      });
  });

  return pubSub;
}


