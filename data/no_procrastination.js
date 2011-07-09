NoProc = {

  set_pause_button_text: function(){
    button = $('#pause_button');
    button.html(NoProc.is_paused() ? 'Unpause' : 'Pause');
  },

  add_domain: function(domain){
    var list = NoProc.domain_list();
    list.push(domain);
    NoProc.set_domain_list(_.sortBy(list, function(val){ return val; }));
  },

  remove_domain: function(domain){
    var list = _.without(NoProc.domain_list(), domain);
    NoProc.set_domain_list(list);
  },

  parse_list: function(){
    html_list = $('#domain_list');
    html_list.html('');
    $.each(NoProc.domain_list(), function(index, value){
      html_list.append('<tr><td class="domain">' + value + '</td><td><a href="#" class="remove">Remove</a></td></tr>');
    });
  },

  bind_events: function(){
    $('.remove').live('click', function(e){
      e.preventDefault();
      var domain = $(this).parents('tr').children('.domain').text();
      NoProc.remove_domain(domain);
      NoProc.parse_list();
    });
    $('#add_domain').click(function(e){
      e.preventDefault();
      var domain = $('#domain').val();
      if(domain != '' && !_.include(NoProc.domain_list(), domain)){
        NoProc.add_domain(domain);
      }
      $('#domain').val('')
      NoProc.parse_list();
    });
    $('#clear_list').click(function(e){
      e.preventDefault();
      NoProc.set_domain_list([]);
      NoProc.parse_list();
    })
    $('#pause_button').click(function(e){
      e.preventDefault();
      NoProc.toggle_pause();
      NoProc.set_pause_button_text();
    });
  },

  initialize_popup: function(){
    NoProc.set_pause_button_text();
    NoProc.set_icon();
    NoProc.parse_list();
    NoProc.bind_events();
  }

}

