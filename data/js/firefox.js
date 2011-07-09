try { NoProc } catch(error) { NoProc = {} };

self.port.on('initialize', function(){
  NoProc.initialize_popup();
});

self.port.on('set_variables', function(params){
  NoProc.set_variables(params);
});

self.on('message', function(params){
  NoProc.set_variables(params);

  if(!NoProc.is_paused()){
    $.each(NoProc.domain_list(), function(index, domain){
      if(document.location.href.match("^https?://(?:[^\/]*)?" + domain)){
        self.postMessage('block');
      }
    });
  }
});

NoProc.set_variables = function(params){
  NoProc.domain_list = function(){ return JSON.parse(params['domain_list'] || '[]'); }
  NoProc.is_paused = function(){ return params['is_paused']; }
}

NoProc.set_domain_list = function(domain_list){
  NoProc.domain_list = function(){ return domain_list; }
  self.port.emit("update_domain_list", JSON.stringify(NoProc.domain_list()));
}

NoProc.set_icon = function(){

}

NoProc.toggle_pause = function(){
  var is_paused = !NoProc.is_paused();
  NoProc.is_paused = function(){ return is_paused; }
  self.port.emit("toggle_pause", NoProc.is_paused());
}

