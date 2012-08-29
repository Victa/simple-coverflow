// jQuery Plugin Boilerplate
// A boilerplate for jumpstarting jQuery plugins development
// version 2.0, July 8th, 2011
// by Stefan Gabos

;(function($) {

    $.coverflow = function($el, options) {

        var defaults = {
            liWidth: 0,
            noreplace: false,
            onSomeEvent: function() {}
        },
        plugin = this,
        browserCSSPrefix = "",
        transitionEndEvent = "transitionend";

        if($.browser.webkit || $.browser.chrome) {
            browserCSSPrefix = "-webkit-";
            transitionEndEvent = "webkitTransitionEnd";
        } else if($.browser.mozilla) {
            browserCSSPrefix = "-moz-";
        } else if($.browser.opera){
            browserCSSPrefix = "-o-";
            transitionEndEvent = "oTransitionEnd";
        } else if($.browser.ie){
            browserCSSPrefix = '-ms-';
            transitionEndEvent = 'transitionend';
        }

        plugin.settings = {};

        var init = function() {
            plugin.settings = $.extend({}, defaults, options);
            
            plugin.$el = $el;

            setVars();
            setWidth();
            setEvents();
            setActive();
            setSlider();
            
            plugin.$list.find('li').eq(0).click();
        };

        plugin.foo_public_method = function() {
            // code goes here
        };


        // Events
        var hideInfos = function(){
            plugin.$more.fadeOut(100);
        };

        var displayInfos = function(){
            var $infos = plugin.$active.find('.coverflow-infos'),
                html = $infos.html();

            plugin.$more.empty().append(html).fadeIn(100);
        };

        // Getters
        var getClosest = function(){
            plugin.settings.noreplace = true;
            var left = Math.abs(parseInt(plugin.$list.css('left'), 10) - (plugin.settings.liWidth*2)),
                index = Math.round(left/plugin.settings.liWidth);
            plugin.$list.find('li').eq(index).click();
        };

        // Setters
        var setVars = function() {
            $.MobileDevice = ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/Android/i)));
            $.Tablet = ((navigator.userAgent.match(/iPad/i)));

            plugin.$list = $el.find('.coverflow-list');
            plugin.$nav = $el.find('.coverflow-nav');
            plugin.$navArrow = $el.find('.coverflow-nav-arrow');
            plugin.$doc = $(document);
            plugin.$more = $el.find('.coverflow-more');
            plugin.$active = plugin.$list.find('li:first-child');
            plugin.$slider = $el.find('.coverflow-slider');
            plugin.$wrapper = $el.find('.coverflow-wrapper');

            plugin.settings.len = $el.find('.coverflow-item').length;
            plugin.settings.liWidth =  parseInt( plugin.$list.find('li:not(.active)').css('width'), 10 );
            plugin.settings.mobile  = ($.Tablet || $.MobileDevice) ? true : false;

            // ==== Mobile support =================
            if(plugin.settings.mobile){
                mobile = {
                    touching: false,
                    nx: 0,
                    oX:0, // Original X-coordinate
                    scrollX: null,
                    leftList: 0
                };

                document.querySelector('.coverflow-list').ontouchmove = function(e){ touchHandler(e); };
                document.querySelector('.coverflow-list').ontouchstart = function(e){ touchHandler(e); };
                document.querySelector('.coverflow-list').ontouchend = function(e){ touchHandler(e); };
            }
        };

        var setActive = function(){
            plugin.$active = plugin.$list.find('.active');
        };

         var setWidth = function(){
            plugin.$list.css({
                width: plugin.settings.len*plugin.settings.liWidth+100
            });
        };

        var setSlider = function(){
            if(plugin.$slider.length && plugin.settings.len >= 6 && !plugin.settings.mobile){
                plugin.$slider.slider({
                    slide: function( event, ui ) {
                        if (plugin.$list.width() > plugin.$wrapper.width() ) {
                            plugin.$list.css( "left", Math.round(
                                ui.value / 100 * ( plugin.$wrapper.width() - plugin.$list.width() - (plugin.settings.liWidth*4) ) + (plugin.settings.liWidth*2)
                            ) + "px" );
                        }
                        plugin.$list.addClass('sliding');
                    },
                    stop: function(event, ui){
                        plugin.$list.removeClass('sliding');
                        getClosest();
                    }
                }).find('.ui-slider-handle').off('keydown');
            }
        };

        var setSliderValue = function(){
            if(plugin.settings.noreplace || plugin.settings.mobile){
                plugin.settings.noreplace = false;
                return false;
            }
            var index = plugin.$active.index(),
                len = plugin.settings.len-1,
                val = Math.round(index/len*100);
            plugin.$slider.slider({ value: val });
        };

        var setEvents = function() {

            plugin.$navArrow.on('click', 'a', function(e){
                e.preventDefault();
                var $this = $(this),
                    width = plugin.settings.liWidth,
                    left = '+='+width;

                if($this.hasClass('coverflow-nav-next')){
                    left = '-='+width;
                    if(!plugin.$list.find('.active').next('li').length)
                        return false;
                    else {
                        plugin.$list.css({
                            left: left
                        })
                        .find('.active').removeClass('active')
                        .next('li').addClass('active');
                    }
                } else {
                    if(!plugin.$list.find('.active').prev('li').length)
                        return false;
                    else {
                        plugin.$list.css({
                            left: left
                        })
                        .find('.active').removeClass('active')
                        .prev('li').addClass('active');
                    }
                }
                plugin.$more.trigger('disableItem');
            });
    
            plugin.$list.on(transitionEndEvent, function(e){
                if(e.target.className === 'coverflow-list'){
                    plugin.$more.trigger('activeItem');
                }
            });

            plugin.$more.on('activeItem', function(){
                setActive();
                displayInfos();
                if(plugin.$slider.length && plugin.settings.len >= 6)
                    setSliderValue();
            });

            plugin.$more.on('disableItem', function(){
                hideInfos();

                if( !Modernizr.csstransitions )
                    plugin.$more.trigger('activeItem');
            });

            plugin.$list.on('click', 'li', function(e){
                e.preventDefault();
                var $this = $(this),
                    index = $this.index(),
                    width = plugin.settings.liWidth;
                if($this.hasClass('active'))
                    return false;

                plugin.$list.css({
                    left: -((index-2)*width)
                })
                .find('.active').removeClass('active');
                $this.addClass('active');
                plugin.$more.trigger('disableItem');
            });

           
            // Set keyboard events
            plugin.$doc.on('keydown', function(e){
                if(e.keyCode === 38 || e.keyCode === 37) {
                    plugin.$list.find('.active').prev('li').click();
                    e.preventDefault();
                    return false;
                }
                if(e.keyCode === 40 || e.keyCode === 39){
                    plugin.$list.find('.active').next('li').click();
                    e.preventDefault();
                    return false;
                }
            });

        };

        // Swipe support
        var touchHandler = function touchHandler(e) {
            if (e.type == "touchstart") {
                mobile.touching = true;
                // If there's only one finger touching
                if (e.touches.length == 1) {
                    // Remove transition
                    plugin.$list.addClass('sliding');
                    
                    var touch = e.touches[0];
                    // If they user tries clicking on a link
                    if(touch.target.onclick) {
                        touch.target.onclick();
                    }
                    // The originating X-coord (point where finger first touched the screen)
                    mobile.oX = touch.pageX;
                    // Reset default values for current X-coord and scroll distance
                    mobile.nX = 0;
                    mobile.scrollX = 0;
                    mobile.leftList = parseInt(plugin.$list.css('left'), 10);
                }
            } else if (e.type == "touchmove") {
                // Prevent the default scrolling behaviour (notice: This disables vertical scrolling as well)
                e.preventDefault();
                mobile.scrollX = null;

                // If there's only one finger touching
                if (e.touches.length == 1) {
                    var touch = e.touches[0];
                    // The current X-coord of the users finger
                    mobile.nX = touch.pageX;
                    
                    // If the user moved the finger from the right to the left
                    if (mobile.oX > mobile.nX) {
                        // Find the scrolling distance
                        mobile.scrollX = -(mobile.oX-mobile.nX);
                    // If the user moved the finger from the left to the right
                    } else if(mobile.nX > mobile.oX) {
                        // Find the scrolling distance
                        mobile.scrollX = mobile.nX-mobile.oX;
                    }
                    
                    var val = mobile.scrollX+mobile.leftList;
                    if(val <= plugin.settings.liWidth*2 &&
                        val >= -(plugin.settings.liWidth*(plugin.settings.len-3))){
                        plugin.$list.css({
                            left: val
                        });    
                    }
                }
            // If the user has removed the finger from the screen
            } else if (e.type == "touchend" || e.type == "touchcancel") {
                // Defines the finger as not touching
                mobile.touching = false;
                plugin.$list.removeClass('sliding');
                getClosest();

            } else {
                // Nothing
            }
        };

        init();

    };

})(jQuery);