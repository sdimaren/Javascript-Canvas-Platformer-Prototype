/*=============================================================================*/
/* Polyfills                                                                   */
/*=============================================================================*/

  var FPS = 60;

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                   window.mozRequestAnimationFrame    || 
                                   window.oRequestAnimationFrame      || 
                                   window.msRequestAnimationFrame     || 
                                   function(callback, element) {
                                     window.setTimeout(callback, 1000 / FPS);
                                   }
  }

/*=============================================================================*/
/* Class Constructor                                                           */
/*=============================================================================*/

  var Class = {
    create: function(prototype) {
      var ctor = function() { if (this.initialize) return this.initialize.apply(this, arguments); }
      ctor.prototype = prototype || {};
      return ctor;
    }
  }

/*=============================================================================*/
/* DOM Utilities                                                               */
/*=============================================================================*/

  var Dom = {
    get:  function(id)                     { return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id); },
    set:  function(id, html)               { Dom.get(id).innerHTML = html;                        },
    on:   function(ele, type, fn, capture) { Dom.get(ele).addEventListener(type, fn, capture);    },
    un:   function(ele, type, fn, capture) { Dom.get(ele).removeEventListener(type, fn, capture); },
    show: function(ele, type)              { Dom.get(ele).style.display = (type || 'block');      }
  }

/*=============================================================================*/
/* Game Loop                                                                   */
/*=============================================================================*/

  var Game = {

    run: function(options) {
    
    var now,
        dt      = 0,
        last    = timestamp(),
        step    = 1/FPS,
        update  = options.update;
        render  = options.render;

    function timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }

    function frame() {
        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);
        while (dt > step) {
            dt = dt - step;
            update(step);
        }
        render(dt);
        last = now;
        requestAnimationFrame(frame, options.canvas);
    }

    frame();

    },

	  animate: function(fps, entity, animation) {
	    animation               = animation               || entity.animation;
	    entity.animationFrame   = entity.animationFrame   || 0;
	    entity.animationCounter = entity.animationCounter || 0;
	    if (entity.animation != animation) {
	      entity.animation        = animation;
	      entity.animationFrame   = 0;
	      entity.animationCounter = 0;
	    }
	    else if (++(entity.animationCounter) == Math.round(fps/animation.fps)) {
	      entity.animationFrame   = normalize(entity.animationFrame + 1, 0, entity.animation.frames);
	      entity.animationCounter = 0;
	    }
	  }
  };

/*=============================================================================*/
/* Canvas Utilities                                                            */
/*=============================================================================*/

  Game.Canvas = {

    create: function(width, height) {
        return this.init(document.createElement('canvas'), width, height);
    },

    init: function(canvas, width, height) {
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },

    render: function(width, height, render, canvas) {
      canvas = canvas || this.create(width, height);
      render(canvas.getContext('2d'), width, height);
      return canvas;
    }
  };

/*=============================================================================*/
/* Asset Loading Utilities                                                     */
/*=============================================================================*/

  Game.Load = {

    images: function(names, callback) {

      var n, name,
        result = {},
        count  = names.length,
        onload = function() { if (--count == 0) callback(result); };

      for(n = 0 ; n < names.length ; n++) {
        name = names[n];
        result[name] = document.createElement('img');
        result[name].addEventListener('load', onload);
        result[name].src = "images/" + name + ".png";
      }
    },

    json: function(url, onsuccess) {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if ((request.readyState == 4) && (request.status == 200))
          onsuccess(JSON.parse(request.responseText));
      }
      request.open('GET', url + '.json', true);
      request.send();
    }  
  };

/*=============================================================================*/
/* Utility Functions                                                           */
/*=============================================================================*/

    var countdown = function(n, dn)       { return n ? Math.max(0, n - (dn || 1)) : 0  },
        rand      = function(min, max)    { return ~~((Math.random()*(max-min+1))+min) },
        bound     = function(x, min, max) { return Math.max(min, Math.min(max, x))     },
        overlap   = function(x1, y1, w1, h1, x2, y2, w2, h2){ return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1); }
        
