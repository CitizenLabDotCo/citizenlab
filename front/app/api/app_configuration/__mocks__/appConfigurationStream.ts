import { BehaviorSubject } from 'rxjs';
import { appConfigurationData } from './useAppConfiguration';

const currentAppConfigurationStream = new BehaviorSubject({
  data: appConfigurationData,
});

export default currentAppConfigurationStream;
