/** Nagging Menu **/
$(function(){
	
	var menu = $('#menu'),
		pos = menu.offset();
		
		$(window).scroll(function(){
			if($(this).scrollTop() > pos.top+menu.height() && menu.hasClass('default')){
				menu.fadeOut('fast', function(){
					$(this).removeClass('default').addClass('fixed').fadeIn('fast');
				});
			} else if($(this).scrollTop() <= pos.top && menu.hasClass('fixed')){
				menu.fadeOut('fast', function(){
					$(this).removeClass('fixed').addClass('default').fadeIn('fast');
				});
			}
		});

});

/** Hover Intent **/
(function($){
	/* hoverIntent by Brian Cherne */
	$.fn.hoverIntent = function(f,g) {
		// default configuration options
		var cfg = {
			sensitivity: 7,
			interval: 100,
			timeout: 0
		};
		// override configuration options with user supplied object
		cfg = $.extend(cfg, g ? { over: f, out: g } : f );

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		var cX, cY, pX, pY;

		// A private function for getting mouse position
		var track = function(ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};

		// A private function for comparing current and previous mouse position
		var compare = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			// compare mouse positions to see if they've crossed the threshold
			if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
				$(ob).unbind("mousemove",track);
				// set hoverIntent state to true (so mouseOut can be called)
				ob.hoverIntent_s = 1;
				return cfg.over.apply(ob,[ev]);
			} else {
				// set previous coordinates for next time
				pX = cX; pY = cY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
			}
		};

		// A private function for delaying the mouseOut function
		var delay = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			ob.hoverIntent_s = 0;
			return cfg.out.apply(ob,[ev]);
		};

		// A private function for handling mouse 'hovering'
		var handleHover = function(e) {
			// next three lines copied from jQuery.hover, ignore children onMouseOver/onMouseOut
			var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
			while ( p && p != this ) { try { p = p.parentNode; } catch(e) { p = this; } }
			if ( p == this ) { return false; }

			// copy objects to be passed into t (required for event object to be passed in IE)
			var ev = jQuery.extend({},e);
			var ob = this;

			// cancel hoverIntent timer if it exists
			if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

			// else e.type == "onmouseover"
			if (e.type == "mouseover") {
				// set "previous" X and Y position based on initial entry point
				pX = ev.pageX; pY = ev.pageY;
				// update "current" X and Y position based on mousemove
				$(ob).bind("mousemove",track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

			// else e.type == "onmouseout"
			} else {
				// unbind expensive mousemove event
				$(ob).unbind("mousemove",track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
			}
		};

		// bind the function to the two event listeners
		return this.mouseover(handleHover).mouseout(handleHover);
	};
	
})(jQuery);

/** Superfish Menu **/
;(function($){
	$.fn.superfish = function(op){

		var sf = $.fn.superfish,
			c = sf.c,
			$arrow = $(['<span class="',c.arrowClass,'"> &#187;</span>'].join('')),
			over = function(){
				var $$ = $(this), menu = getMenu($$);
				clearTimeout(menu.sfTimer);
				$$.showSuperfishUl().siblings().hideSuperfishUl();
			},
			out = function(){
				var $$ = $(this), menu = getMenu($$), o = sf.op;
				clearTimeout(menu.sfTimer);
				menu.sfTimer=setTimeout(function(){
					o.retainPath=($.inArray($$[0],o.$path)>-1);
					$$.hideSuperfishUl();
					if (o.$path.length && $$.parents(['li.',o.hoverClass].join('')).length<1){over.call(o.$path);}
				},o.delay);	
			},
			getMenu = function($menu){
				var menu = $menu.parents(['ul.',c.menuClass,':first'].join(''))[0];
				sf.op = sf.o[menu.serial];
				return menu;
			},
			addArrow = function($a){ $a.addClass(c.anchorClass).append($arrow.clone()); };
			
		return this.each(function() {
			var s = this.serial = sf.o.length;
			var o = $.extend({},sf.defaults,op);
			o.$path = $('li.'+o.pathClass,this).slice(0,o.pathLevels).each(function(){
				$(this).addClass([o.hoverClass,c.bcClass].join(' '))
					.filter('li:has(ul)').removeClass(o.pathClass);
			});
			sf.o[s] = sf.op = o;
			
			$('li:has(ul)',this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over,out).each(function() {
				if (o.autoArrows) addArrow( $('>a:first-child',this) );
			})
			.not('.'+c.bcClass)
				.hideSuperfishUl();
			
			var $a = $('a',this);
			$a.each(function(i){
				var $li = $a.eq(i).parents('li');
				$a.eq(i).focus(function(){over.call($li);}).blur(function(){out.call($li);});
			});
			o.onInit.call(this);
			
		}).each(function() {
			var menuClasses = [c.menuClass];
			if (sf.op.dropShadows  && !($.browser.msie && $.browser.version < 7)) menuClasses.push(c.shadowClass);
			$(this).addClass(menuClasses.join(' '));
		});
	};

	var sf = $.fn.superfish;
	sf.o = [];
	sf.op = {};
	sf.IE7fix = function(){
		var o = sf.op;
		if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity!=undefined)
			this.toggleClass(sf.c.shadowClass+'-off');
		};
	sf.c = {
		bcClass     : 'sf-breadcrumb',
		menuClass   : 'sf-js-enabled',
		anchorClass : 'sf-with-ul',
		arrowClass  : 'sf-sub-indicator',
		shadowClass : 'sf-shadow'
	};
	sf.defaults = {
		hoverClass	: 'sfHover',
		pathClass	: 'overideThisToUse',
		pathLevels	: 1,
		delay		: 800,
		animation	: {opacity:'show'},
		speed		: 'normal',
		autoArrows	: true,
		dropShadows : true,
		disableHI	: false,		// true disables hoverIntent detection
		onInit		: function(){}, // callback functions
		onBeforeShow: function(){},
		onShow		: function(){},
		onHide		: function(){}
	};
	$.fn.extend({
		hideSuperfishUl : function(){
			var o = sf.op,
				not = (o.retainPath===true) ? o.$path : '';
			o.retainPath = false;
			var $ul = $(['li.',o.hoverClass].join(''),this).add(this).not(not).removeClass(o.hoverClass)
					.find('>ul').hide().css('visibility','hidden');
			o.onHide.call($ul);
			return this;
		},
		showSuperfishUl : function(){
			var o = sf.op,
				sh = sf.c.shadowClass+'-off',
				$ul = this.addClass(o.hoverClass)
					.find('>ul:hidden').css('visibility','visible');
			sf.IE7fix.call($ul);
			o.onBeforeShow.call($ul);
			$ul.animate(o.animation,o.speed,function(){ sf.IE7fix.call($ul); o.onShow.call($ul); });
			return this;
		}
	});

})(jQuery);

// initialise plugins
		jQuery(function(){
			jQuery('ul.sf-menu').superfish();
		});


/** Slotmachine Tab Menu **/
var columnReadyCounter = 0;

// This is the callback function for the "hiding" animations
// it gets called for each animation (since we don't know which is slowest)
// the third time it's called, then it resets the column positions
function ifReadyThenReset() {
	
	columnReadyCounter++;
	
	if (columnReadyCounter == 3) {
		$(".col").not(".current .col").css("top", 350);
		columnReadyCounter = 0;
	}

};

// When the DOM is ready
$(function() {
	
	var $allContentBoxes = $(".content-box"),
	    $allTabs = $(".tabs li a"),
	    $el, $colOne, $colTwo, $colThree,
	    hrefSelector = "",
	    speedOne = 1000,
		speedTwo = 2000,
		speedThree = 1500;
	
	// first tab and first content box are default current
	$(".tabs li:first-child a, .content-box:first").addClass("current");
	$(".box-wrapper .current .col").css("top", 0);
	
	$("#slot-machine-tabs").delegate(".tabs a", "click", function() {
		
		$el = $(this);
		
		if ( (!$el.hasClass("current")) && ($(":animated").length == 0 ) ) {
		
			// current tab correctly set
			$allTabs.removeClass("current");
			$el.addClass("current");
			
			// optional... random speeds each time.
			speedOne = Math.floor(Math.random()*1000) + 500;
			speedTwo = Math.floor(Math.random()*1000) + 500;
			speedThree = Math.floor(Math.random()*1000) + 500;
		
			// each column is animated upwards to hide
			// kind of annoyingly redudundant code
			$colOne = $(".box-wrapper .current .col-one");
			$colOne.animate({
				"top": -$colOne.height()
			}, speedOne);
		
			$colTwo = $(".box-wrapper .current .col-two");
			$colTwo.animate({
				"top": -$colTwo.height()
			}, speedTwo);
		
			$colThree = $(".box-wrapper .current .col-three");
			$colThree.animate({
				"top": -$colThree.height()
			}, speedThree);
			
			// new content box is marked as current
			$allContentBoxes.removeClass("current");		
			hrefSelector = $el.attr("href");
			$(hrefSelector).addClass("current");
		
			// columns from new content area are moved up from the bottom
			// also annoying redundant and triple callback seems weird
			$(".box-wrapper .current .col-one").animate({
				"top": 0
			}, speedOne, function() {
				ifReadyThenReset();
			});
	
			$(".box-wrapper .current .col-two").animate({
				"top": 0
			}, speedTwo, function() {
				ifReadyThenReset();
			});
		
			$(".box-wrapper .current .col-three").animate({
				"top": 0
			}, speedThree, function() {
				ifReadyThenReset();
			});
		
		};

	});

});

/** Coin Slider **/
(function($) {

	var params 		= new Array;
	var order		= new Array;
	var images		= new Array;
	var links		= new Array;
	var linksTarget = new Array;
	var titles		= new Array;
	var interval	= new Array;
	var imagePos	= new Array;
	var appInterval = new Array;	
	var squarePos	= new Array;	
	var reverse		= new Array;
	
	$.fn.coinslider= $.fn.CoinSlider = function(options){
		
		init = function(el){
				
			order[el.id] 		= new Array();	// order of square appereance
			images[el.id]		= new Array();
			links[el.id]		= new Array();
			linksTarget[el.id]	= new Array();
			titles[el.id]		= new Array();
			imagePos[el.id]		= 0;
			squarePos[el.id]	= 0;
			reverse[el.id]		= 1;						
				
			params[el.id] = $.extend({}, $.fn.coinslider.defaults, options);
						
			// create images, links and titles arrays
			$.each($('#'+el.id+' img'), function(i,item){
				images[el.id][i] 		= $(item).attr('src');
				links[el.id][i] 		= $(item).parent().is('a') ? $(item).parent().attr('href') : '';
				linksTarget[el.id][i] 	= $(item).parent().is('a') ? $(item).parent().attr('target') : '';
				titles[el.id][i] 		= $(item).next().is('div') ? $(item).next().html() : '';
				$(item).hide();
				$(item).next().hide();
			});			
			

			// set panel
			$(el).css({
				'background-image':'url('+images[el.id][0]+')',
				'width': params[el.id].width,
				'height': params[el.id].height,
				'position': 'relative',
				'background-position': 'top left'
			}).wrap("<div class='coin-slider' id='coin-slider-"+el.id+"' />");	
			
				
			// create title bar
			$('#'+el.id).append("<div class='cs-title' id='cs-title-"+el.id+"' style='position: absolute; bottom:0; left: 0; z-index: 999;'></div>");
						
			$.setFields(el);
			
			if(params[el.id].navigation)
				$.setNavigation(el);
			
			$.transition(el,0);
			$.transitionCall(el);
				
		}
		
		// squares positions
		$.setFields = function(el){
			
			tWidth = sWidth = parseInt(params[el.id].width/params[el.id].spw);
			tHeight = sHeight = parseInt(params[el.id].height/params[el.id].sph);
			
			counter = sLeft = sTop = 0;
			tgapx = gapx = params[el.id].width - params[el.id].spw*sWidth;
			tgapy = gapy = params[el.id].height - params[el.id].sph*sHeight;
			
			for(i=1;i <= params[el.id].sph;i++){
				gapx = tgapx;
				
					if(gapy > 0){
						gapy--;
						sHeight = tHeight+1;
					} else {
						sHeight = tHeight;
					}
				
				for(j=1; j <= params[el.id].spw; j++){	

					if(gapx > 0){
						gapx--;
						sWidth = tWidth+1;
					} else {
						sWidth = tWidth;
					}

					order[el.id][counter] = i+''+j;
					counter++;
					
					if(params[el.id].links)
						$('#'+el.id).append("<a href='"+links[el.id][0]+"' class='cs-"+el.id+"' id='cs-"+el.id+i+j+"' style='width:"+sWidth+"px; height:"+sHeight+"px; float: left; position: absolute;'></a>");
					else
						$('#'+el.id).append("<div class='cs-"+el.id+"' id='cs-"+el.id+i+j+"' style='width:"+sWidth+"px; height:"+sHeight+"px; float: left; position: absolute;'></div>");
								
					// positioning squares
					$("#cs-"+el.id+i+j).css({ 
						'background-position': -sLeft +'px '+(-sTop+'px'),
						'left' : sLeft ,
						'top': sTop
					});
				
					sLeft += sWidth;
				}

				sTop += sHeight;
				sLeft = 0;					
					
			}
			
			
			$('.cs-'+el.id).mouseover(function(){
				$('#cs-navigation-'+el.id).show();
			});
		
			$('.cs-'+el.id).mouseout(function(){
				$('#cs-navigation-'+el.id).hide();
			});	
			
			$('#cs-title-'+el.id).mouseover(function(){
				$('#cs-navigation-'+el.id).show();
			});
		
			$('#cs-title-'+el.id).mouseout(function(){
				$('#cs-navigation-'+el.id).hide();
			});	
			
			if(params[el.id].hoverPause){	
				$('.cs-'+el.id).mouseover(function(){
					params[el.id].pause = true;
				});
			
				$('.cs-'+el.id).mouseout(function(){
					params[el.id].pause = false;
				});	
				
				$('#cs-title-'+el.id).mouseover(function(){
					params[el.id].pause = true;
				});
			
				$('#cs-title-'+el.id).mouseout(function(){
					params[el.id].pause = false;
				});	
			}
					
			
		};
				
		
		$.transitionCall = function(el){
		
			clearInterval(interval[el.id]);	
			delay = params[el.id].delay + params[el.id].spw*params[el.id].sph*params[el.id].sDelay;
			interval[el.id] = setInterval(function() { $.transition(el)  }, delay);
			
		}
		
		// transitions
		$.transition = function(el,direction){
			
			if(params[el.id].pause == true) return;
			
			$.effect(el);
			
			squarePos[el.id] = 0;
			appInterval[el.id] = setInterval(function() { $.appereance(el,order[el.id][squarePos[el.id]])  },params[el.id].sDelay);
					
			$(el).css({ 'background-image': 'url('+images[el.id][imagePos[el.id]]+')' });
			
			if(typeof(direction) == "undefined")
				imagePos[el.id]++;
			else
				if(direction == 'prev')
					imagePos[el.id]--;
				else
					imagePos[el.id] = direction;
		
			if  (imagePos[el.id] == images[el.id].length) {
				imagePos[el.id] = 0;
			}
			
			if (imagePos[el.id] == -1){
				imagePos[el.id] = images[el.id].length-1;
			}
	
			$('.cs-button-'+el.id).removeClass('cs-active');
			$('#cs-button-'+el.id+"-"+(imagePos[el.id]+1)).addClass('cs-active');
			
			if(titles[el.id][imagePos[el.id]]){
				$('#cs-title-'+el.id).css({ 'opacity' : 0 }).animate({ 'opacity' : params[el.id].opacity }, params[el.id].titleSpeed);
				$('#cs-title-'+el.id).html(titles[el.id][imagePos[el.id]]);
			} else {
				$('#cs-title-'+el.id).css('opacity',0);
			}				
				
		};
		
		$.appereance = function(el,sid){

			$('.cs-'+el.id).attr('href',links[el.id][imagePos[el.id]]).attr('target',linksTarget[el.id][imagePos[el.id]]);

			if (squarePos[el.id] == params[el.id].spw*params[el.id].sph) {
				clearInterval(appInterval[el.id]);
				return;
			}

			$('#cs-'+el.id+sid).css({ opacity: 0, 'background-image': 'url('+images[el.id][imagePos[el.id]]+')' });
			$('#cs-'+el.id+sid).animate({ opacity: 1 }, 300);
			squarePos[el.id]++;
			
		};
		
		// navigation
		$.setNavigation = function(el){
			// create prev and next 
			$(el).append("<div id='cs-navigation-"+el.id+"'></div>");
			$('#cs-navigation-'+el.id).hide();
			
			$('#cs-navigation-'+el.id).append("<a href='#' id='cs-prev-"+el.id+"' class='cs-prev'>prev</a>");
			$('#cs-navigation-'+el.id).append("<a href='#' id='cs-next-"+el.id+"' class='cs-next'>next</a>");
			$('#cs-prev-'+el.id).css({
				'position' 	: 'absolute',
				'top'		: params[el.id].height/2 - 15,
				'left'		: 0,
				'z-index' 	: 999,
				'line-height': '30px',
				'opacity'	: params[el.id].opacity
			}).click( function(e){
				e.preventDefault();
				$.transition(el,'prev');
				$.transitionCall(el);		
			}).mouseover( function(){ $('#cs-navigation-'+el.id).show() });
	
			$('#cs-next-'+el.id).css({
				'position' 	: 'absolute',
				'top'		: params[el.id].height/2 - 15,
				'right'		: 0,
				'z-index' 	: 999,
				'line-height': '30px',
				'opacity'	: params[el.id].opacity
			}).click( function(e){
				e.preventDefault();
				$.transition(el);
				$.transitionCall(el);
			}).mouseover( function(){ $('#cs-navigation-'+el.id).show() });
		
			// image buttons
			$("<div id='cs-buttons-"+el.id+"' class='cs-buttons'></div>").appendTo($('#coin-slider-'+el.id));

			
			for(k=1;k<images[el.id].length+1;k++){
				$('#cs-buttons-'+el.id).append("<a href='#' class='cs-button-"+el.id+"' id='cs-button-"+el.id+"-"+k+"'>"+k+"</a>");
			}
			
			$.each($('.cs-button-'+el.id), function(i,item){
				$(item).click( function(e){
					$('.cs-button-'+el.id).removeClass('cs-active');
					$(this).addClass('cs-active');
					e.preventDefault();
					$.transition(el,i);
					$.transitionCall(el);				
				})
			});	
			
			$('#cs-navigation-'+el.id+' a').mouseout(function(){
				$('#cs-navigation-'+el.id).hide();
				params[el.id].pause = false;
			});						

			$("#cs-buttons-"+el.id).css({
	
				
			});
			
				
		}




		// effects
		$.effect = function(el){
			
			effA = ['random','swirl','rain','straight'];
			if(params[el.id].effect == '')
				eff = effA[Math.floor(Math.random()*(effA.length))];
			else
				eff = params[el.id].effect;

			order[el.id] = new Array();

			if(eff == 'random'){
				counter = 0;
				  for(i=1;i <= params[el.id].sph;i++){
				  	for(j=1; j <= params[el.id].spw; j++){	
				  		order[el.id][counter] = i+''+j;
						counter++;
				  	}
				  }	
				$.random(order[el.id]);
			}
			
			if(eff == 'rain')	{
				$.rain(el);
			}
			
			if(eff == 'swirl')
				$.swirl(el);
				
			if(eff == 'straight')
				$.straight(el);
				
			reverse[el.id] *= -1;
			if(reverse[el.id] > 0){
				order[el.id].reverse();
			}

		}

			
		// shuffle array function
		$.random = function(arr) {
						
		  var i = arr.length;
		  if ( i == 0 ) return false;
		  while ( --i ) {
		     var j = Math.floor( Math.random() * ( i + 1 ) );
		     var tempi = arr[i];
		     var tempj = arr[j];
		     arr[i] = tempj;
		     arr[j] = tempi;
		   }
		}	
		
		//swirl effect by milos popovic
		$.swirl = function(el){

			var n = params[el.id].sph;
			var m = params[el.id].spw;

			var x = 1;
			var y = 1;
			var going = 0;
			var num = 0;
			var c = 0;
			
			var dowhile = true;
						
			while(dowhile) {
				
				num = (going==0 || going==2) ? m : n;
				
				for (i=1;i<=num;i++){
					
					order[el.id][c] = x+''+y;
					c++;

					if(i!=num){
						switch(going){
							case 0 : y++; break;
							case 1 : x++; break;
							case 2 : y--; break;
							case 3 : x--; break;
						
						}
					}
				}
				
				going = (going+1)%4;

				switch(going){
					case 0 : m--; y++; break;
					case 1 : n--; x++; break;
					case 2 : m--; y--; break;
					case 3 : n--; x--; break;		
				}
				
				check = $.max(n,m) - $.min(n,m);			
				if(m<=check && n<=check)
					dowhile = false;
									
			}
		}

		// rain effect
		$.rain = function(el){
			var n = params[el.id].sph;
			var m = params[el.id].spw;

			var c = 0;
			var to = to2 = from = 1;
			var dowhile = true;


			while(dowhile){
				
				for(i=from;i<=to;i++){
					order[el.id][c] = i+''+parseInt(to2-i+1);
					c++;
				}
				
				to2++;
				
				if(to < n && to2 < m && n<m){
					to++;	
				}
				
				if(to < n && n>=m){
					to++;	
				}
				
				if(to2 > m){
					from++;
				}
				
				if(from > to) dowhile= false;
				
			}			

		}

		// straight effect
		$.straight = function(el){
			counter = 0;
			for(i=1;i <= params[el.id].sph;i++){
				for(j=1; j <= params[el.id].spw; j++){	
					order[el.id][counter] = i+''+j;
					counter++;
				}
				
			}
		}

		$.min = function(n,m){
			if (n>m) return m;
			else return n;
		}
		
		$.max = function(n,m){
			if (n<m) return m;
			else return n;
		}		
	
	this.each (
		function(){ init(this); }
	);
	

	};
	
	
	// default values
	$.fn.coinslider.defaults = {	
		width: 558, // width of slider panel
		height: 321, // height of slider panel
		spw: 9, // squares per width
		sph: 5, // squares per height
		delay: 3000, // delay between images in ms
		sDelay: 20, // delay beetwen squares in ms
		opacity: 0.9, // opacity of title and navigation
		titleSpeed: 500, // speed of title appereance in ms
		effect: '', // random, swirl, rain, straight
		navigation: true, // prev next and buttons
		links : false, // show images as links 
		hoverPause: true // pause on hover		
	};	
	
})(jQuery);


/** Tab Menu **/
$(document).ready(function() {	


  //Get all the LI from the #tabMenu UL
  $('#tabMenu > li').click(function(){
        
    //remove the selected class from all LI    
    $('#tabMenu > li').removeClass('selected');
    
    //Reassign the LI
    $(this).addClass('selected');
    
    //Hide all the DIV in .boxBody
    $('.boxBody div').slideUp('1500');
    
    //Look for the right DIV in boxBody according to the Navigation UL index, therefore, the arrangement is very important.
    $('.boxBody div:eq(' + $('#tabMenu > li').index(this) + ')').slideDown('1500');
    
  }).mouseover(function() {

    //Add and remove class, Personally I dont think this is the right way to do it, anyone please suggest    
    $(this).addClass('mouseover');
    $(this).removeClass('mouseout');   
    
  }).mouseout(function() {
    
    //Add and remove class
    $(this).addClass('mouseout');
    $(this).removeClass('mouseover');    
    
  });

  //Mouseover with animate Effect for Category menu list
  $('.boxBody #category li').mouseover(function() {

    //Change background color and animate the padding
    $(this).css('backgroundColor','');
    $(this).children().animate({paddingLeft:"20px"}, {queue:false, duration:300});
  }).mouseout(function() {
    
    //Change background color and animate the padding
    $(this).css('backgroundColor','');
    $(this).children().animate({paddingLeft:"0"}, {queue:false, duration:300});
  });  
	
  //Mouseover effect for Posts, Comments, Famous Posts and Random Posts menu list.
  $('.boxBody li').click(function(){
    window.location = $(this).find("a").attr("href");
  }).mouseover(function() {
    $(this).css('backgroundColor','');
  }).mouseout(function() {
    $(this).css('backgroundColor','');
  });  	
	
});	

/** Font Style **/
if (document.layers) { 
document.write('<link rel=stylesheet href="js/font.css">') 
} 
else { 
document.write('<link rel=stylesheet href="js/font.css">') 
}