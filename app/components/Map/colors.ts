function getColor(d: number) {
  return d > 4  ? '#B495A4' :
         d > 3  ? '#CEA991' :
         d > 2  ? '#F9F9CD' :
         d > 1  ? '#ADD0CA' :
                  '#92ABB9';
}

export function style(feature) {
  return {
      fillColor: getColor(feature.properties.disadvantage),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
  };
}
