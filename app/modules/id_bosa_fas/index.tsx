import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import BosaFasButton from './components/BosaFasButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': BosaFasButton,
  },
};

export default configuration;
