//在model的设置器中   

function User(uid){
  var binder = new DataBinder(uid),
  
  user = {
    //...
    attriures: {},
    set: function(attr_name,val){
        this.attriures[attr_name] = val;
        //使用“publish”方法  
        binder.publish(uid+ ":change", attr_name, val,this);
    },
    get: function(attr_name){
        return this.attriures[attr_name];
    },
    _binder: binder
  }
  binder.on(uid +":change",function(vet,attr_name,new_val,initiator){
    if(initiator !== user){
        user.set(attr_name,new_val);
    }
  }) 
  return user;
}  