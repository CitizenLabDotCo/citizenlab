import { isEmpty, get } from 'lodash-es';
import { Multiloc } from 'typings';
import { IUpdatedProjectProperties } from 'services/projects';
import messages from '../messages';

export default function validate(
  currentTenant,
  projectAttributesDiff,
  project,
  formatMessage
) {
  let hasErrors = false;

  const currentTenantLocales = currentTenant
    ? currentTenant.data.attributes.settings.core.locales
    : null;

  const projectAttrs = {
    ...(project ? project.data.attributes : {}),
    ...projectAttributesDiff,
  } as IUpdatedProjectProperties;

  const titleError = {} as Multiloc;

  if (currentTenantLocales) {
    currentTenantLocales.forEach((currentTenantLocale) => {
      const title = get(projectAttrs.title_multiloc, currentTenantLocale);

      if (isEmpty(title)) {
        titleError[currentTenantLocale] = formatMessage(
          messages.noTitleErrorMessage
        );
        hasErrors = true;
      }
    });
  }

  return { hasErrors, titleError };
}
