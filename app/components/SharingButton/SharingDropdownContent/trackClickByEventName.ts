import { trackEventByName } from 'utils/analytics';

export default function trackClick(trackName) {
  trackEventByName(trackName);
}
