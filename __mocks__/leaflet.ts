import OriginalLeaflet from 'leaflet';

const leaflet: typeof OriginalLeaflet = jest.genMockFromModule('leaflet');

leaflet.popup = jest.fn(() => {
  const popupResponse = {
    setLatLng: jest.fn(() => popupResponse),
    setContent: jest.fn(() => popupResponse),
    openOn: jest.fn(() => popupResponse),
  };
  return popupResponse;
});

export default leaflet;
