import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

class Internationalization {
  locale: string | null;
  currentTenantLocales: string[] | null;
  subscriptions: Rx.Subscription[];

  constructor() {
    this.locale = null;
    this.currentTenantLocales = null;
    this.subscriptions = [
      Rx.Observable.combineLatest(
        localeStream().observable,
        currentTenantStream().observable
      ).subscribe(([locale, currentTenant]) => {
        this.locale = locale;
        this.currentTenantLocales = (currentTenant ? currentTenant.data.attributes.settings.core.locales : null);
      })
    ];
  }

  getLocalized(multiLoc: { [key: string]: string } | null) {
    let text: string = '';

    if (multiLoc !== null && _.isObject(multiLoc) && !_.isEmpty(multiLoc)) {
      if (this.locale && multiLoc[this.locale]) {
        text = multiLoc[this.locale];
      } else if (this.currentTenantLocales && this.currentTenantLocales.length > 0) {
        this.currentTenantLocales.forEach((currentTenantLocale) => {
          if (multiLoc[currentTenantLocale]) {
            text = multiLoc[currentTenantLocale];
            return false;
          }

          return true;
        });
      }

      if (text === '') {
        if (multiLoc['en']) {
          text = multiLoc['en'];
        } else if (multiLoc['nl']) {
          text = multiLoc['nl'];
        } else if (multiLoc['fr']) {
          text = multiLoc['fr'];
        }
      }
    }

    return text;
  }
}

const i18n = new Internationalization();
export default i18n;
