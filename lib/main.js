const widgets = require("widget");
const data = require("self").data;
var pageMod = require("page-mod");
var storage = require("simple-storage").storage;


var NoProc = {
  params: function(){
    return {
      domain_list: storage['no_procrast.domain_list'],
      is_paused: storage['no_procrast.is_paused']
    }
  },

  icon: function(){
   return data.url(NoProc.is_paused() ? 'hand_off_16.png' : 'hand_on_16.png');
  },

  is_paused: function(){
    return storage['no_procrast.is_paused'];
  }
};

pageMod.PageMod({
  include: "*",
  contentScriptFile: [
    data.url("jquery.min.js"),
    data.url("underscore.min.js"),
    data.url('firefox.js'),
  ],
  onAttach: function onAttach(worker) {
    worker.postMessage(NoProc.params());
    worker.on('message', function(message){
      if(message == 'block'){
        worker.tab.attach({
          contentScript: 'document.location = "' + data.url("you_should_be_working.html") + '"'
        });
      }
    });
  }
});

var panel = require("panel").Panel({
  contentURL: data.url("popup.html"),
  width: 340,
  height: 460,
  contentScriptFile: [
    data.url("jquery.min.js"),
    data.url("underscore.min.js"),
    data.url('no_procrastination.js'),
    data.url('firefox.js')
  ]
});

var widget = widgets.Widget({
  id: "no_procrastination_link",
  label: "No Procrastination",
  contentURL: NoProc.icon(),
  onClick: function() {
    panel.show();
    panel.port.emit("set_variables", NoProc.params())
    panel.port.emit("initialize")
  }
});

panel.port.on('update_domain_list', function(domain_list){
  storage['no_procrast.domain_list'] = domain_list;
});

panel.port.on('toggle_pause', function(is_paused){
  storage['no_procrast.is_paused'] = is_paused;
  widget.contentURL = NoProc.icon();
});

