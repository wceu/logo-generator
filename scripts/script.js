(function ( $ ) {
  "use strict";

  var url = new URL(window.location),
      urlParams = new URLSearchParams(url.search);

  // extractUrl(urlParams);


  $('.input-color-base').on('input', function() {
    syncInputs(
      $(this).val(),
      '.input-color-base',
      '.base',
      'fill'
    );
    updateUrl( 'base', $(this).val() );
  });

  $('.input-color-dots').on('input', function(){
    syncInputs(
      $(this).val(),
      '.input-color-dots',
      '.dot',
      'fill'
    );
    updateUrl('dots', $(this).val());
  });

  $('.input-color-wordpress-logo').on('input', function() {
    syncInputs(
      $(this).val(),
      '.input-color-wordpress-logo',
      '.wordpress-logo',
      'fill'
    );
    updateUrl('logoColor', $(this).val());
  });

  $('.input-color-wordpress-logo-background').on('input', function(){
    syncInputs(
      $(this).val(),
      '.input-color-wordpress-logo-background',
      '.wordpress-logo-background',
      'fill'
    );
    updateUrl('logoBg', $(this).val());
  });

  $('.input-color-background').on('input', function() {
    syncInputs(
      $(this).val(),
      '.input-color-background',
      '.preview',
      'style'
    );
    updateUrl('appBg', $(this).val());
  });

  function syncInputs(value, selector, elToPrev, type) {
    if( value != '') {
      if (type === 'fill') {
        $(elToPrev).attr( 'fill', value );
      } else {
        $(elToPrev).attr( 'style', 'background: ' + value );
        $(elToPrev + ' svg').attr( 'style', 'background: ' + value );
      }
      $(selector).val(value);
    }
  }


  /**
   * URL manipulations with replaceState
   * on input value change
   */
   function updateUrl(paramName, paramValue) {
    var url = new URL(window.location),
        urlParams = new URLSearchParams(url.search);
    if (paramName === 'marker') {
      urlParams.set( paramName, paramValue );
    } else {
      urlParams.set( paramName, paramValue.slice(1) );
    }
    window.history.replaceState({}, '', window.location.pathname + '?' + urlParams);
   };


   /**
   * URL params extraction
   */
   function extractUrl(params) {
    if(params !== '') {
      if (urlParams.has('base')) {
        var baseParam = '#' + urlParams.get('base');
        $('.input-color-base').attr( 'value', baseParam );
        syncInputs(
          baseParam,
          '.input-color-base',
          '.base',
          'fill'
        );
      }
      if (urlParams.has('dots')) {
        var dotsParam = '#' + urlParams.get('dots');
        $('.input-color-dots').attr( 'value', dotsParam );
        syncInputs(
          dotsParam,
          '.input-color-dots',
          '.dot',
          'fill'
        );
      }
      if (urlParams.has('logoColor')) {
        $('.input-color-wordpress-logo').attr( 'value', '#' + urlParams.get('logoColor') );
        syncInputs(
          '#' + urlParams.get('logoColor'),
          '.input-color-wordpress-logo',
          '.wordpress-logo',
          'fill'
        );
      }
      if(urlParams.has('logoBg')) {
        $('.input-color-wordpress-logo-background').attr( 'value', '#' + urlParams.get('logoBg') );
        syncInputs(
          '#' + urlParams.get('logoBg'),
          '.input-color-wordpress-logo-background',
          '.wordpress-logo-background',
          'fill'
        );
      }
      if(urlParams.has('appBg')) {
        $('.input-color-background').attr( 'value', '#' + urlParams.get('appBg') );
        syncInputs(
          '#' + urlParams.get('appBg'),
          '.input-color-background',
          '.preview',
          'style'
        );
      } 
      if(urlParams.has('marker')) {
        var urlMarker = urlParams.get('marker');
        createMarker(urlMarker);
      } 
    }
   }


  /*
   * Save as SVG
   *
   * Based on this http://stackoverflow.com/a/28087280/7809192
   */

  function toBase64 (str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function triggerDownload () {
    var html = 'data:text/attachment;base64,' + toBase64(document.querySelector('.preview').innerHTML);
    var evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });

    var a = document.createElement('a');
    a.setAttribute('download', 'logo.svg');
    a.setAttribute('href', html);
    a.setAttribute('target', '_blank');

    a.dispatchEvent(evt);
  }

  document.querySelector('.button-download.svg').addEventListener('click', function () {
    triggerDownload();
  });


  var asPng = $('.button-download.png');
  var svgNode = $('#svgLogo');

  /**
   * Saves svg element as png image
   * ( uses saveSvgAsPng library )
  */
  asPng.on('click', function() {
    saveSvgAsPng(document.getElementById('svgLogo'), "wceu2018logo.png", { encoderOptions: 1 });
  });
  


  /*
   * Dot focus
   *
   * Cycle through available dot sizes
   * Example http://jsfiddle.net/jBJ3B/
   */

  // Experimenting, feel free to delete :)
  // var dotSizeArray = ["12", "18", "28"];
  // var dotIndex = 0;

  // $('.dot').on('click', function nextSize(){
  //   $(this).attr( 'r', + dotSizeArray[dotIndex] );
  //   dotIndex = (dotIndex + 1) % (dotSizeArray.length);
  // })

  /*
   * TODO: Focus area
   * Steps to generate the focus area
   * 1) Make the clicked .dot largest (level 0), update radius value to r="28", and fill-opacity="1"
   * 2) Duplicate the clicked .dot in place, with the radius value r="9" and match the fill value with the one from .base
   * 3) Relative to clicked .dot, make the top/right/bottom/left neighbouring .dot (level 1) r="18"
   * 4) Relative to level 1 .dot, make the top/right/bottom/left neighbouring .dot (level 2) r="12" (but make sure that level 0/1 .dots remain unchanged)
   */

  var $dot = $('.dot');
  var markerExist = false;
  var $resetMarkerBtn = $('.button-markerReset');

  $dot.on('click', function(event) {
    if(markerExist === false) {
      createMarker(event);
      markerExist = true;
      $resetMarkerBtn.prop('disabled', false);
    } else {
      resetMap();
      createMarker(event);
    }
  });

  $resetMarkerBtn.on('click', function() {
    markerExist = false;
    $resetMarkerBtn.prop('disabled', true);
    resetMap();
  });


  /**
   * Reset map to starting position
  */
  function resetMap() {
    $('.world .dot--large').remove();
    $('.world .base--small').remove();
    var $dots = $('.world .dot');
    $dots.each(function() {
      var dataR = $(this).data('r');
      $(this).attr('r', dataR);
    });
    urlParams.delete('marker');
    window.history.replaceState({}, '', window.location.pathname + '?' + urlParams);
  };


  /**
   * Function for creating marker
  */
  function createMarker(e) {
    var transform;
    if (typeof e === 'string') {
      var left = e.slice(0, e.indexOf('-'));
      var top = e.slice(e.indexOf('-') + 1);
      transform = 'transform(' + left + ' ' + top + ')';
      markerExist = true;
      $resetMarkerBtn.prop('disabled', false);
    } else {
      // Retrive transform property value of clicked element    
      transform = SVG._getTransform(e);
    }
    extractTransform(transform);
    // Extract X and Y cords
    var x = SVG._getXCord(transform),
        y = SVG._getYCord(transform);
    // Prev in line
    SVG._previuosPins(x, y);
    // // Next in line
    SVG._nextPins(x, y);
    // // Prev on top
    SVG._topPins(x, y);
    // // Next on bottom
    SVG._bottomPins(x, y);
    // Create center pin
    SVG._createCenter('.world', x, y);
  };

  /**
   * Extracts transform values from attrs
   * and sets marker as URL param
   */ 
  function extractTransform(transformValue) {
    let left = transformValue.slice(transformValue.indexOf('(') + 1, transformValue.indexOf(' '));
    let top = transformValue.slice(transformValue.indexOf(' ') + 1, transformValue.indexOf(')'));
    var markerValue = left + '-' + top;
    updateUrl('marker', markerValue);
  };


  /**
   * Small module named 'SVG' for any kind
   * of svg element manipulation
  */
  var SVG = (function(clickedElement, cityCursor) {
    return {

      // Returns transform value of clicked element
      _getTransform: function(clickedElement) {
        return clickedElement.currentTarget.attributes.transform.value;
      },

      // Extracts X cordinate from passed value
      _getXCord: function( transformValue ) {
        if( transformValue ) {
          return parseInt(transformValue.slice(transformValue.indexOf('(') + 1, transformValue.indexOf(' ')));
        }
      },

      // Extracts Y cordinate from passed value
      _getYCord: function( transformValue ) {
        if( transformValue ) {
          return parseInt(transformValue.slice(transformValue.indexOf(' ') + 1, transformValue.indexOf(')')));
        }
      },

      // Creates row on top
      _topPins: function( x, y ) {
        if( x && y ) {
          var topLeftSibling      = document.querySelector('[transform="translate(' + ( x - 24 ) + ' ' + ( y - 24 ) + ')"]'),
              topMiddleSibling    = document.querySelector('[transform="translate(' + x + ' ' + ( y - 24 ) + ')"]'),
              topMiddleSiblingFar = document.querySelector('[transform="translate(' + x + ' ' + ( y - 48 ) + ')"]'),
              topRightSibling     = document.querySelector('[transform="translate(' + ( x + 24 ) + ' ' + ( y - 24 ) + ')"]');
          
          if( topMiddleSibling ) { topMiddleSibling.setAttribute('r', 18); }
          if( topMiddleSibling && topMiddleSiblingFar ) { topMiddleSiblingFar.setAttribute('r', 12) }
          if( topMiddleSibling && topLeftSibling ) { topLeftSibling.setAttribute('r', 12); }
          if( topMiddleSibling && topRightSibling ) { topRightSibling.setAttribute('r', 12); }
        }
      },

      // Creates two previous circles
      _previuosPins: function( x, y ) {
        if( x && y ) {
          var nearSibling = document.querySelector('[transform="translate(' + ( x - 24 ) + ' ' + y + ')"]'),
              farSibling  = document.querySelector('[transform="translate(' + ( x - 48 ) + ' ' + y + ')"]');
          if( nearSibling ) { nearSibling.setAttribute('r', 18); }
          if( nearSibling && farSibling ) { farSibling.setAttribute('r', 12); }
        }
      },

      // Creates two next circles
      _nextPins: function( x, y ) {
        if( x && y ) {
          var nearSibling = document.querySelector('[transform="translate(' + ( x + 24 ) + ' ' + y + ')"]'),
              farSibling  = document.querySelector('[transform="translate(' + ( x + 48 ) + ' ' + y + ')"]');
          if( nearSibling ) { nearSibling.setAttribute('r', 18); }
          if( nearSibling && farSibling ) { farSibling.setAttribute('r', 12); }
        }
      },

      // Creates row on bottom
      _bottomPins: function( x, y ) {
        if( x && y ) {
          var bottomLeftSibling      = document.querySelector('[transform="translate(' + ( x - 24 ) + ' ' + ( y + 24 ) + ')"]'),
              bottomMiddleSibling    = document.querySelector('[transform="translate(' + x + ' ' + ( y + 24 ) + ')"]'),
              bottomMiddleSiblingFar = document.querySelector('[transform="translate(' + x + ' ' + ( y + 48 ) + ')"]'),
              bottomRightSibling     = document.querySelector('[transform="translate(' + ( x + 24 ) + ' ' + ( y + 24 ) + ')"]');
          if( bottomMiddleSibling ) { bottomMiddleSibling.setAttribute('r', 18); }
          if( bottomMiddleSibling && bottomMiddleSiblingFar ) { bottomMiddleSiblingFar.setAttribute('r', 12); }
          if( bottomMiddleSibling && bottomLeftSibling ) { bottomLeftSibling.setAttribute('r', 12); }
          if( bottomMiddleSibling && bottomRightSibling ) { bottomRightSibling.setAttribute('r', 12); }
        }
      },

      // Create center pins
      _createCenter: function( svgRootEl, x, y ) {
        var root = document.querySelector(svgRootEl);
        var largeCircle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        largeCircle.setAttribute('fill', $('#select-color-dots').val());
        largeCircle.setAttribute('class', 'dot');
        largeCircle.setAttribute('cx', 12);
        largeCircle.setAttribute('cy', 12);
        largeCircle.setAttribute('r', 28);
        largeCircle.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
        largeCircle.setAttribute('class', 'dot dot--large');
        var smallCircle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        smallCircle.setAttribute('cx', 12);
        smallCircle.setAttribute('cy', 12);
        smallCircle.setAttribute('r', 9);
        smallCircle.setAttribute('fill', $('#select-color-base').val());
        smallCircle.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
        smallCircle.setAttribute('class', 'base base--small');
        root.appendChild(largeCircle);
        root.appendChild(smallCircle);
      }

    }
  })();

  extractUrl(urlParams);

}(jQuery));