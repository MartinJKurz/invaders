// general stuff
function toggleClasses(el, classes) {
    $(el).toggleClass(classes);
}

// changing visibility of the element, following the target element
// -> clicking on the element (a h2, or whatever) will hide the
// following element (typically a div, p, section)
// css is needed to make this work:
// .hide_following + * { display: none; }
function toggleNextVisibility(ev) {
    var el = ev.target;
    if (el) {
      toggleClasses(el, 'hide_following');
    }
    return false;
}


// set hide following functionality for all elements with specific class
$(function() {
  $('.toggle_next_visibility').click(toggleNextVisibility);
});


// ajax for user scores
$(function() {
  $('#user_scores th a, #user_scores .pagination a').live('click', function() {
    $.getScript(this.href);
    return false;
  });
});

// ajax for users list
$(function() {
  $('#users_list th a, #users_list .pagination a').live('click', function() {
    $.getScript(this.href);
    return false;
  });
});



