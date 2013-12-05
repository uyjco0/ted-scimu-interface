
// Protect the '$' sign against a clash in the global environment
(function($) {

        // The code in the callback will be executed when the DOM is ready
        // It is a shorcut for: jQuery(document).ready(function() {});
	$(function() {

          var   el1 = $('#main-cont')
              , el2 = $('#contact-cont')
              , el3 = $('#footer-cont')
              , el4 = $('#footer-head')
              , el5 = $('#footer-foot')
                // The viewport height
                // I'm not substracting the padding added to the body for the fixed navbar, because it
                // is working OK with Firefox, but not with Chrome
              , viewport_height = $(window).height()
                // The available viewport 's height
              , visible_height = viewport_height
              , foot_height = Math.floor(visible_height/2)
              , footer_foot_height = 50;

          // Set the height as a function of the available viewport 's height
          el1.height(visible_height);
          el2.height(visible_height);
          el3.height(foot_height);
          el4.height(foot_height - footer_foot_height);
          el5.height(footer_foot_height);

          // Init the popover in the elements with popover
	  $(".popover-init").each(function(index) {
            $(this).tooltip();
            $(this).popover();
          });

          // It closes the open tooltips or popover open when it is clicked 
          // in any outside to anywhere else on the document
          // See at: http://mattlockyer.com/2013/04/08/close-a-twitter-bootstrap-popover-when-clicking-outside/
          $(':not(#anything)').on('click', function (e) {
          	$(".popover-init").each(function(index) {
                        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            			$(this).popover('hide');
                        }
          	});    
	  });

        });

})(jQuery);  
