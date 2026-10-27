import { initializePhasePreview } from 'utils/phasePreview/runtime';

// Preview protection must be installed before application imports can make requests.
initializePhasePreview().then(() => import('./root'));
