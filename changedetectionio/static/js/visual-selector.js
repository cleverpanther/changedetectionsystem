var current_selected_i;
var state_clicked=false;

var c = document.getElementById("selector-canvas");

// greyed out fill context
var xctx = c.getContext("2d");
// redline highlight context
var ctx = c.getContext("2d");


var current_default_xpath=$("#css_filter").val();


function fetch_data() {
  // Image is ready
  $('.fetching-update-notice').html("Fetching element data..");

  $.ajax({
    url: watch_visual_selector_data_url,
    context: document.body
  }).done(function (data) {
    $('.fetching-update-notice').html("Rendering..");
    reflow_selector(data);
    $('.fetching-update-notice').fadeOut();
  });
};

$(document).on('keydown', function(event) {
  if (event.key == "Escape") {
    state_clicked=false;
  }
});

function reflow_selector(selector_data) {

  //  $('#selector-canvas').attr('width',
  // $("img#selector-background")[0].getBoundingClientRect().width);

  var selector_image = document.getElementById("selector-background");
  var selector_image_rect = selector_image.getBoundingClientRect();
  var selector_currnt_xpath_text=$("#selector-current-xpath span");

  $('#selector-canvas').attr('height', selector_image_rect.height);
  $('#selector-canvas').attr('width', selector_image_rect.width);


  ctx.strokeStyle = 'rgb(255,0,0, 0.8)';
  ctx.lineWidth = 2;

  // set this on resize too
  var x_scale = selector_image_rect.width / selector_image.naturalWidth;
  var y_scale = selector_image_rect.height / selector_image.naturalHeight;

  console.log(selector_data.length + " selectors found");

  // highlight the default one if we can find it in the xPath list
  // or the xpath matches the default one
  for (var i = selector_data.length; i!=0; i--) {
    var sel = selector_data[i-1];
    if(selector_data[i - 1].xpath == current_default_xpath) {
      ctx.strokeRect(sel.left * x_scale, sel.top * y_scale, sel.width * x_scale, sel.height * y_scale);
      current_selected_i=i-1;
      highlight_current_selected_i();
      break;
    }
  }

  $('#selector-canvas').bind('mousemove', function (e) {

    if(state_clicked) {
      return;
    }
    ctx.clearRect(0, 0, c.width, c.height);
    current_selected_i=null;

    // Reverse order - the most specific one should be deeper/"laster"
    // Basically, find the most 'deepest'
    for (var i = selector_data.length; i!=0; i--) {
      // draw all of them? let them choose somehow?
      var sel = selector_data[i-1];
      // If we are in a bounding-box
      if (e.offsetY > sel.top * y_scale && e.offsetY < sel.top * y_scale + sel.height * y_scale
          &&
          e.offsetX > sel.left * y_scale && e.offsetX < sel.left * y_scale + sel.width * y_scale

      ) {

        // FOUND ONE
        set_current_selected_text(sel.xpath);

        ctx.strokeRect(sel.left * x_scale, sel.top * y_scale, sel.width * x_scale, sel.height * y_scale);
        // no need to keep digging
        // @todo or, O to go out/up, I to go in
        // or double click to go up/out the selector?
        current_selected_i=i-1;
        break;
      }
    }

  }.debounce(5));

  function set_current_selected_text(s) {
    selector_currnt_xpath_text[0].innerHTML=s;
  }

  function highlight_current_selected_i() {
    if(state_clicked) {
      state_clicked=false;
      xctx.clearRect(0,0,c.width, c.height);
      return;
    }

    var sel = selector_data[current_selected_i];
    $("#css_filter").val(sel.xpath);
    xctx.fillStyle = 'rgba(225,225,225,0.8)';
    xctx.fillRect(0,0,c.width, c.height);
    xctx.clearRect(sel.left * x_scale, sel.top * y_scale, sel.width * x_scale, sel.height * y_scale);
    state_clicked=true;
    set_current_selected_text(sel.xpath);

  }


  $('#selector-canvas').bind('mousedown', function (e) {
    highlight_current_selected_i();
  });
}
