// @ts-nocheck

// This is a direct copy of the source code of https://github.com/rowanwins/leaflet-simplestyle.
// Installing it through npm and importing it as a normal package unfortunatly crashes IE11.
// Therefore it's added directly to the codebase, which fixes the IE11 issue.

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
    // eslint-disable-next-line no-param-reassign
    fp = fp || {};

    const size = fp['marker-size'] || 'medium';
    const symbol =
      'marker-symbol' in fp && fp['marker-symbol'] !== ''
        ? `${fp['marker-symbol']}`
        : '';
    const color = (fp['marker-color'] || '7e7e7e').replace('#', '');

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

    if (useMakiMarkers && symbol) {
      fetch(
        `https://unpkg.com/@icon/maki-icons/icons/${symbol.toLowerCase()}.svg`
      )
        .then((response) => response.text())
        .then((svg) => {
          // Insert correct color
          const endOfFirst = svg.indexOf('>');
          const newSvg = `${svg.slice(
            0,
            endOfFirst
          )} fill="#${color}" ${svg.slice(endOfFirst)}`;
          // Get a URL
          // const blob = new Blob([newSvg], { type: 'image/svg+xml' });
          // const url = URL.createObjectURL(blob);
          const makiSizes = {
            small: [20, 50],
            medium: [30, 70],
            large: [35, 90],
          };
          // iconOptions.iconUrl = `${protocol}//a.tiles.mapbox.com/v3/marker/pin-${size.charAt(
          //   0
          // )}${symbol.toLowerCase()}+${color}${L.Browser.retina ? '@2x' : ''}.png`;
          iconOptions.url = undefined;
          iconOptions.iconSize = makiSizes[size];
          iconOptions.iconAnchor = [
            makiSizes[size][0] / 2,
            makiSizes[size][1] / 2,
          ];
          iconOptions.popupAnchor = [0, -makiSizes[size][1] / 2];
        })
        .catch(console.error.bind(console));
    }

    return L.divIcon(
      {
        className: 'leafletSvg',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="30px" height="30px"><path fill='#${color}' d="M2 1S1 1 1 2v5.158C1 8.888 1.354 11 4.5 11H5V8L2.5 9s0-2.5 2.5-2.5V5c0-.708.087-1.32.5-1.775.381-.42 1.005-1.258 2.656-.471L9 3.303V2s0-1-1-1c-.708 0-1.978 1-3 1S2.787 1 2 1zm1 2a1 1 0 110 2 1 1 0 010-2zm4 1S6 4 6 5v5c0 2 1 4 4 4s4-2 4-4V5c0-1-1-1-1-1-.708 0-1.978 1-3 1S7.787 4 7 4zm1 2a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2zm-4.5 4h5s0 2.5-2.5 2.5S7.5 10 7.5 10z"/></svg>`,
      },
      iconOptions
    );
  }

  L.GeoJSON.include({
    options: {
      useSimpleStyle: false,
      useMakiMarkers: false,
    },

    _useSimpleStyle() {
      if (this.options.useSimpleStyle) this.useSimpleStyle();
    },

    toggleMakiMarkers() {
      this.options.useMakiMarkers = !this.options.useMakiMarkers;
      this._useSimpleStyle();
    },

    useSimpleStyle() {
      this.options.useSimpleStyle = true;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      this.eachLayer(function (l) {
        if ('icon' in l.options) {
          l.setIcon(getIcon(l.feature.properties, that.options.useMakiMarkers));
        }
      });
      this.setStyle(style);
    },

    discardSimpleStyle() {
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

export {};
