const widgets = require("widget");
const data = require("self").data;
var pageMod = require("page-mod");
var storage = require("simple-storage").storage;

// Why does it have to be so difficult?
const {Cc,Ci} = require("chrome");
var interval = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
const TYPE_REPEATING_PRECISE = Ci.nsITimer.TYPE_REPEATING_PRECISE;


var NoProc = {
  params: function(){
    return {
      domain_list: storage['no_procrast.domain_list'],
      is_paused: storage['no_procrast.is_paused']
    }
  },

  icon: function(){
   return data.url(NoProc.is_paused() ? 'img/hand_off_16.png' : 'img/hand_on_16.png');
  },

  is_paused: function(){
    return storage['no_procrast.is_paused'];
  },

  reset_timer: function(){
    storage['no_procrast.last_change'] = (new Date).getTime();
    NoProc.set_timer();
  },

  last_change: function(){
    return storage['no_procrast.last_change'] || (new Date).getTime();
  },

  current_time: function(){
    return (new Date).getTime();
  },

  time_difference: function(){
    var difference = Math.floor((NoProc.current_time() - NoProc.last_change()) / 60000);
    var minutes = difference % 60;
    var hours = Math.floor(difference / 60);
    if(hours > 9){
      return hours + 'h';
    }
    if(hours == 0){
      return minutes + 'm';
    }
    return hours + 'h' + minutes;
  },

  set_timer: function(){
    content = '<div style="color:red;font-size:12px;font:arial;margin-top:2px;">';
    content += NoProc.time_difference();
    content += '</div>';
    if(NoProc.timer){
      NoProc.timer.destroy();
    }
    if(NoProc.is_paused()){
      NoProc.timer = widgets.Widget({
        id: "timer",
        label: "timer",
        content: content,
        width: 25
      });
    }
    if(panel.isShowing){
      panel.port.emit("set_timer", NoProc.time_difference())
    }
  }
};

// Worker to block sites
pageMod.PageMod({
  include: "*",
  contentScriptFile: [
    data.url("js/jquery.min.js"),
    data.url("js/underscore.min.js"),
    data.url('js/firefox.js'),
  ],
  onAttach: function onAttach(worker) {
    worker.postMessage(NoProc.params());
    worker.on('message', function(message){
      if(message == 'block'){
        worker.tab.attach({
          contentScript: 'document.location = "' + data.url("html/you_should_be_working.html") + '"'
        });
      }
    });
  }
});

// popup that appears when the icon is clicked
var panel = require("panel").Panel({
  contentURL: data.url("html/popup.html"),
  width: 340,
  height: 460,
  contentScriptFile: [
    data.url("js/jquery.min.js"),
    data.url("js/underscore.min.js"),
    data.url('js/no_procrastination.js'),
    data.url('js/firefox.js')
  ]
});

panel.initialize = function(){
  panel.port.emit("set_variables", NoProc.params());
  panel.port.emit("initialize")
  panel.port.emit("set_timer", NoProc.time_difference())
}

panel.initialize();

// Icon
var widget = widgets.Widget({
  id: "no_procrastination_link",
  label: "No Procrastination",
  contentURL: NoProc.icon(),
  onClick: function() {
    panel.show();
    NoProc.set_timer();
  }
});

panel.port.on('update_domain_list', function(domain_list){
  storage['no_procrast.domain_list'] = domain_list;
});

panel.port.on('toggle_pause', function(is_paused){
  storage['no_procrast.is_paused'] = is_paused;
  NoProc.reset_timer();
  widget.contentURL = NoProc.icon();
});

NoProc.reset_timer();
interval.init(NoProc.set_timer, 60*1000, TYPE_REPEATING_PRECISE);

