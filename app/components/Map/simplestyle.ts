// @ts-nocheck

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) : factory();
})(function () {
  'use strict';

  // Pinched from mapbox.js
  // https://github.com/mapbox/mapbox.js/blob/publisher-production/src/simplestyle.js

  // an implementation of the simplestyle spec for polygon and linestring features
  // https://github.com/mapbox/simplestyle-spec
  const defaults = {
    stroke: '#555555',
    'stroke-width': 2,
    'stroke-opacity': 1,
    fill: '#555555',
    'fill-opacity': 0.5,
  };

  const mapping = [
    ['stroke', 'color'],
    ['stroke-width', 'weight'],
    ['stroke-opacity', 'opacity'],
    ['fill', 'fillColor'],
    ['fill-opacity', 'fillOpacity'],
  ];

  function fallback(a, b) {
    const c = {};
    for (const k in b) {
      if (a[k] === undefined) c[k] = b[k];
      else c[k] = a[k];
    }
    return c;
  }

  function remap(a) {
    const d = {};
    for (let i = 0; i < mapping.length; i++) {
      d[mapping[i][1]] = a[mapping[i][0]];
    }
    return d;
  }

  function style(feature) {
    return remap(fallback(feature.properties || {}, defaults));
  }

  // Pinched from mapbox.js
  // https://github.com/mapbox/mapbox.js/blob/publisher-production/src/marker.js
  function getIcon(fp, useMakiMarkers) {
    fp = fp || {};

    const size = fp['marker-size'] || 'medium',
      symbol =
        'marker-symbol' in fp && fp['marker-symbol'] !== ''
          ? `-${fp['marker-symbol']}`
          : '',
      color = (fp['marker-color'] || '7e7e7e').replace('#', '');

    const sizes = {
      small: [23, 23],
      medium: [30, 30],
      large: [37, 37],
    };

    const iconOptions = {
      iconUrl: encodeURI(
        `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15'><path d='M7.5 0C5.1 0 2.2 1.5 2.2 5.3c0 2.5 4 8.2 5.3 9.7 1-1.5 5.3-7 5.3-9.7C12.8 1.5 9.9 0 7.5 0z' fill='#${color}'/></svg>`
      ).replace('#', '%23'),
      iconSize: sizes[size],
      shadowUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAABaBAMAAADA2vJjAAAAGFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABWNxwqAAAACHRSTlMACRcjKzJAOtxk//MAAABzSURBVDjL7ZDRDYAwCER1A3EDcQNxA3EDGzeoE2jX91JNTYoLaPr+eDkIUBUK/6TOarpongC1HCFKhrkXwNxRMiKqOslwO3TJODugcHEecT/Oa/BbgOMOqkZI3eHBvkyIvSrbaMfbJeyq9iB7dv6cQuFrnJu2IxWE6etQAAAAAElFTkSuQmCC',
      shadowSize: sizes[size],
      shadowAnchor: [sizes[size][0] / 2, sizes[size][1] / 2],
      iconAnchor: [sizes[size][0] / 2, sizes[size][1]],
      popupAnchor: [0, -sizes[size][1] / 2],
    };

    if (useMakiMarkers) {
      const makiSizes = {
        small: [20, 50],
        medium: [30, 70],
        large: [35, 90],
      };
      let protocol = window.document.location.protocol;
      if (protocol.indexOf('http') === -1) protocol = 'https:';
      iconOptions.iconUrl = `${protocol}//a.tiles.mapbox.com/v3/marker/pin-${size.charAt(
        0
      )}${symbol.toLowerCase()}+${color}${L.Browser.retina ? '@2x' : ''}.png`;
      iconOptions.iconSize = makiSizes[size];
      iconOptions.iconAnchor = [makiSizes[size][0] / 2, makiSizes[size][1] / 2];
      iconOptions.popupAnchor = [0, -makiSizes[size][1] / 2];
    }

    return L.icon(iconOptions);
  }

  L.GeoJSON.include({
    options: {
      useSimpleStyle: false,
      useMakiMarkers: false,
    },

    _useSimpleStyle: function () {
      if (this.options.useSimpleStyle) this.useSimpleStyle();
    },

    toggleMakiMarkers: function () {
      this.options.useMakiMarkers = !this.options.useMakiMarkers;
      this._useSimpleStyle();
    },

    useSimpleStyle: function () {
      this.options.useSimpleStyle = true;
      const that = this;
      this.eachLayer(function (l) {
        if ('icon' in l.options) {
          l.setIcon(getIcon(l.feature.properties, that.options.useMakiMarkers));
        }
      });
      this.setStyle(style);
    },

    discardSimpleStyle: function () {
      this.options.useSimpleStyle = false;
      this.eachLayer(function (l) {
        if (l.options.icon !== undefined) {
          l.setIcon(L.Icon.Default.prototype);
        }
      });
      this.resetStyle();
    },
  });

  L.GeoJSON.addInitHook('_useSimpleStyle');
});
