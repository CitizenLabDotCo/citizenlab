import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import {
  allCategories,
  getDestinationConfigs,
  IDestination,
  IDestinationConfig,
  isDestinationActive,
  TCategory,
} from './destinations';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import Container from './Container';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import {
  getConsent,
  IConsentCookie,
  ISavedDestinations,
  setConsent,
} from './consent';
import eventEmitter from 'utils/eventEmitter';
import { IAppConfigurationData } from 'services/appConfiguration';

// the format in which the user will make its choices,
export type IPreferences = Partial<Record<TCategory, boolean>>;

// the format in which we'll present the destinations to the user
export type CategorizedDestinations = Record<TCategory, IDestination[]>;

interface InputProps {}
interface DataProps {
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
}
interface Props extends InputProps, DataProps {}

interface State {
  preferences: IPreferences;
  cookieConsent: IConsentCookie | null;
}

export class ConsentManager extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    const cookieConsent = getConsent();

    this.state = {
      cookieConsent,
      preferences: this.getCurrentPreferences(cookieConsent),
    };

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      cookieConsent?.savedChoices || {}
    );
  }

  getActiveDestinations(): IDestinationConfig[] {
    const { authUser, tenant } = this.props;
    if (isNilOrError(tenant)) return [];
    return getDestinationConfigs().filter((config) =>
      isDestinationActive(config, tenant, authUser)
    );
  }

  getCategory(
    tenant: IAppConfigurationData,
    destinationConfig: IDestinationConfig
  ) {
    return typeof destinationConfig.category === 'function'
      ? destinationConfig.category(tenant)
      : destinationConfig.category;
  }

  categorizeDestinations(
    destinations: IDestinationConfig[]
  ): CategorizedDestinations {
    const { tenant } = this.props;
    const output = {};
    allCategories().forEach((category) => (output[category] = []));

    if (isNilOrError(tenant)) {
      return output as CategorizedDestinations;
    }

    destinations.forEach((destinationConfig) => {
      const category = this.getCategory(tenant, destinationConfig);
      output[category].push(destinationConfig.key);
    });

    return output as CategorizedDestinations;
  }

  getCurrentPreferences(cookieConsent: IConsentCookie | null) {
    const newDestinations = this.getActiveDestinations().filter(
      (config) => cookieConsent?.savedChoices[config.key] === undefined
    );

    const output = {};
    allCategories().forEach((category) => {
      // if it was enabled and there's a new destination
      if (
        !cookieConsent ||
        (cookieConsent[category] &&
          newDestinations.find((config) => config.category === category))
      ) {
        // reset the category
        output[category] = undefined;
      } else {
        // keep the previous value
        output[category] = cookieConsent[category];
      }
    });
    return output;
  }

  setPreferences = (changedPreference) => {
    this.setState((state) => ({
      ...state,
      preferences: { ...state.preferences, ...changedPreference },
    }));
  };

  resetPreferences = () => {
    this.setState((state) => ({
      ...state,
      preferences: this.getCurrentPreferences(state.cookieConsent),
    }));
  };

  saveConsent = () => {
    const { preferences, cookieConsent } = this.state;
    const { tenant } = this.props;

    if (isNilOrError(tenant)) return;

    const newChoices: ISavedDestinations = {};
    this.getActiveDestinations().forEach((config) => {
      newChoices[config.key] = preferences[this.getCategory(tenant, config)];
    });

    setConsent({
      ...preferences,
      savedChoices: {
        ...cookieConsent?.savedChoices,
        ...newChoices,
      },
    });

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      newChoices
    );

    this.setState({ cookieConsent: getConsent() });
  };

  accept = () => {
    this.setState(
      (state) => {
        const newPreferences = {};
        allCategories().forEach((category) => {
          if (state.preferences[category] === undefined) {
            newPreferences[category] = true;
          }
        });
        return {
          ...state,
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        };
      },
      () => this.saveConsent()
    );
  };

  toggleDefault = (modalOpened) => {
    this.setState((state) => {
      const newPreferences = {};
      allCategories().forEach((category) => {
        // set to false when opening the modal
        if (!modalOpened) {
          if (state.preferences[category] === undefined) {
            newPreferences[category] = false;
          }
        }
        // reset false to undefined when closing the modal
        else if (state.preferences[category] === false) {
          newPreferences[category] = undefined;
        }
      });
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...newPreferences,
        },
      };
    });
  };

  render() {
    const { tenant, authUser } = this.props;
    const { preferences, cookieConsent } = this.state;

    const activeDestinations = this.getActiveDestinations();

    const activeCategorizedDestinations =
      this.categorizeDestinations(activeDestinations);

    const isConsentRequired =
      !cookieConsent ||
      !!activeDestinations.find(
        (destination) =>
          !Object.keys(cookieConsent?.savedChoices).includes(destination.key)
      );

    if (!isNilOrError(tenant) && authUser !== undefined) {
      return (
        <Container
          accept={this.accept}
          onToggleModal={this.toggleDefault}
          setPreferences={this.setPreferences}
          resetPreferences={this.resetPreferences}
          saveConsent={this.saveConsent}
          isConsentRequired={isConsentRequired}
          preferences={preferences}
          categorizedDestinations={activeCategorizedDestinations}
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ConsentManager {...inputProps} {...dataProps} />}
  </Data>
);
