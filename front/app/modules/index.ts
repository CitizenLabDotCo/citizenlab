import { loadModules } from 'utils/moduleUtils';

import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';
import flagInappropriateContentConfiguration from './commercial/flag_inappropriate_content';
import googleAnalyticsConfiguration from './commercial/google_analytics';
import googleTagManagerConfiguration from './commercial/google_tag_manager';
import idBogusConfiguration from './commercial/id_bogus';
import idBosaFasConfiguration from './commercial/id_bosa_fas';
import idCowConfiguration from './commercial/id_cow';
import idGentRrnConfiguration from './commercial/id_gent_rrn';
import idIdCardLookupConfiguration from './commercial/id_id_card_lookup';
import idOostendeRrnConfiguration from './commercial/id_oostende_rrn';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import impactTrackingConfiguration from './commercial/impact_tracking';
import intercomConfiguration from './commercial/intercom';
import machineTranslationsConfiguration from './commercial/machine_translations';
import matomoConfiguration from './commercial/matomo';
import posthogConfiguration from './commercial/posthog_integration';
import posthogUserTrackingConfiguration from './commercial/posthog_user_tracking';
import satismeterConfiguration from './commercial/satismeter';
import smartGroupsConfiguration from './commercial/smart_groups';
import widgetsConfiguration from './commercial/widgets';

export default loadModules([
  {
    configuration: smartGroupsConfiguration,
  },
  {
    configuration: googleTagManagerConfiguration,
  },
  {
    configuration: matomoConfiguration,
  },
  {
    configuration: posthogConfiguration,
  },
  {
    configuration: posthogUserTrackingConfiguration,
  },
  {
    configuration: googleAnalyticsConfiguration,
  },
  {
    configuration: intercomConfiguration,
  },
  {
    configuration: satismeterConfiguration,
  },
  {
    configuration: flagInappropriateContentConfiguration,
  },
  {
    configuration: ideaAssignmentConfiguration,
  },
  {
    configuration: adminProjectTemplatesConfiguration,
  },
  {
    configuration: idBosaFasConfiguration,
  },
  {
    configuration: idCowConfiguration,
  },
  {
    configuration: idBogusConfiguration,
  },
  {
    configuration: idIdCardLookupConfiguration,
  },
  {
    configuration: idGentRrnConfiguration,
  },
  {
    configuration: idOostendeRrnConfiguration,
  },
  {
    configuration: machineTranslationsConfiguration,
  },
  {
    configuration: widgetsConfiguration,
  },
  {
    configuration: impactTrackingConfiguration,
  },
]);
