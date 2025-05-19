import { stylingConsts } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

export function getLeaveFormDestination(
  participationMethod?: ParticipationMethod
) {
  switch (participationMethod) {
    case 'community_monitor_survey':
      return 'go-back';
    case 'native_survey':
      return 'project-page';
    default:
      return 'project-page';
  }
}

// GeoJSON values in the data may contain nested arrays, which Rails strong parameters cannot handle.
// This function converts GeoJSON values to 'well known text' (WKT) format before submitting the form(s).
// The BE will then convert the WKT back to GeoJSON, if valid, before saving the data.
export function convertGeojsonToWKT(rawData: any) {
  const data = Object.assign({}, rawData);

  for (const key in data) {
    if (typeof data[key] === 'object') {
      for (const subKey in data[key]) {
        if (['Point', 'LineString', 'Polygon'].includes(data[key][subKey])) {
          const coordinates = data[key]['coordinates'].flat(2);
          let coordinatesString = '';

          for (let i = 0; i < coordinates.length; i++) {
            coordinatesString += coordinates[i];
            if (i < coordinates.length - 1) {
              coordinatesString += i % 2 === 1 ? ', ' : ' ';
            }
          }

          const nesting = data[key]['type'] === 'Polygon' ? 2 : 1;
          data[key] =
            `${data[key]['type'].toUpperCase()} ` +
            `${'('.repeat(nesting)}${coordinatesString}${')'.repeat(nesting)}`;
        }
      }
    }
  }

  return data;
}

export function calculateDynamicHeight(isSmallerThanPhone: boolean) {
  const viewportHeight = window.innerHeight;
  const menuHeight = stylingConsts.menuHeight;
  const mobileTopBarHeight = stylingConsts.mobileTopBarHeight;
  const extraSpace = 80;

  const dynamicHeight =
    viewportHeight -
    (isSmallerThanPhone ? mobileTopBarHeight : menuHeight) -
    extraSpace;

  return `${dynamicHeight}px`;
}
