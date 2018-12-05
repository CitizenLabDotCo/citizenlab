import OriginalLeaflet from 'leaflet';

const leaflet: typeof OriginalLeaflet = jest.genMockFromModule('leaflet');

const popupResponse = {
  setLatLng: jest.fn(() => popupResponse),
  setContent: jest.fn(() => popupResponse),
  openOn: jest.fn(() => popupResponse),
};

leaflet.popup = jest.fn(() => {
  return popupResponse;
});

export default leaflet;
