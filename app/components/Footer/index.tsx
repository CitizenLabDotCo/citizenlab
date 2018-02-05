import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import { Dropdown } from 'semantic-ui-react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages.js';
import { appLocalePairs } from 'i18n';

// services
import { localeStream, updateLocale } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { LEGAL_PAGES } from 'services/pages';

// style
import styled from 'styled-components';
import { media, color } from 'utils/styleUtils';
import { Locale } from 'typings';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  z-index: 0;
`;

const FirstLine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 110px 20px;
  background: #fff;
`;

const TenantLogo = styled.img`
  height: 50px;
  margin-bottom: 20px;
`;

const TenantSlogan = styled.div`
  width: 100%;
  max-width: 340px;
  color: #444;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  text-align: center;
`;

const SecondLine = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-top: 1px solid #eaeaea;
  padding: 14px 28px;

  ${media.smallerThanMaxTablet`
    display: flex;
    text-align: center;
    flex-direction: column;
    justify-content: center;
  `}
`;

const PagesNav = styled.nav`
  color: #999;
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;

  li {
    display: inline-block;
  }

  ${media.smallerThanMaxTablet`
    order: 2;
    text-align: center;
    justify-content: center;
    margin-top: 30px;
    margin-bottom: 15px;
  `}
`;

const StyledLink = styled(Link) `
  color: #999;
  font-weight: 400;
  font-size: 14px;
  line-height: 19px;
  text-decoration: none;

  &:hover {
    color: #000;
  }

  ${media.smallerThanMaxTablet`
    font-size: 13px;
    line-height: 16px;
  `}
`;

const Separator = styled.span`
  color: #999;
  font-weight: 400;
  font-size: 13px;
  line-height: 19px;
  padding-left: 15px;
  padding-right: 15px;

  ${media.smallerThanMaxTablet`
    padding-left: 8px;
    padding-right: 8px;
  `}
`;

const CitizenLabLogo = styled(Icon) `
  height: 22px;
  fill: #999;
  margin-left: 8px;
  transition: all 150ms ease-out;
`;

const PoweredBy = styled.a`
  color: #999;
  font-weight: 300;
  font-size: 14px;
  line-height: 19px;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  outline: none;

  ${media.biggerThanMaxTablet`
    &:hover {
      color: #999;

      ${CitizenLabLogo} {
        fill: #555;
      }
    }
  `}

  ${media.smallerThanMaxTablet`
    order: 1;
    margin-top: 10px;
    color: #333;

    &:hover {
      color: #333;
    }

    ${CitizenLabLogo} {
      fill: #333;
    }
  `}
`;

const LanguageSelectionWrapper = styled.div`
  padding-left: 1rem;
  margin-left: 1rem;
  border-left: 1px solid ${color('separation')};
  text-align: right;

  .ui.selection.dropdown {
    color: ${color('label')};
    display: none;
  }

  &.show {
    .ui.selection.dropdown {
      display: block;
    }
  }

  ${media.smallerThanMaxTablet`
    border-left: 0;
    margin-left: 0;
    margin-top: 10px;
    margin-bottom: 20px;
    padding-left: 0;
  `}
`;

type Props = {
  showCityLogoSection?: boolean | undefined;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  showCityLogoSection: boolean;
  languageOptions: {
    key: string;
    value: Locale;
    text: string;
  }[]
};

class Footer extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  public static defaultProps: Partial<Props> = {
    showCityLogoSection: true
  };

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      showCityLogoSection: false,
      languageOptions: [],
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.setState({ showCityLogoSection: !!this.props.showCityLogoSection });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$
      ).subscribe(([locale, currentTenant]) => {
        const languageOptions = currentTenant.data.attributes.settings.core.locales.map((locale) => ({
          key: locale,
          value: locale,
          text: appLocalePairs[locale],
        }));

        this.setState({ locale, currentTenant, languageOptions });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleLanguageChange (_event, { value }) {
    updateLocale(value);
  }

  render() {
    const { locale, currentTenant, showCityLogoSection } = this.state;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const currentTenantLogo = currentTenant.data.attributes.logo.medium;
      const organizationNameMulitiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const currentTenantName = getLocalized(organizationNameMulitiLoc, locale, currentTenantLocales);
      const organizationType = currentTenant.data.attributes.settings.core.organization_type;
      const slogan = currentTenantName ? <FormattedMessage {...messages.slogan} values={{ name: currentTenantName, type: organizationType }} /> : '';
      const poweredBy = <FormattedMessage {...messages.poweredBy} />;

      return (
        <Container>
          {showCityLogoSection &&
            <FirstLine>
              {currentTenantLogo && <TenantLogo src={currentTenantLogo} />}
              <TenantSlogan>{slogan}</TenantSlogan>
            </FirstLine>
          }

          <SecondLine>
            <PagesNav>
              {LEGAL_PAGES.map((slug, index) => (
                <span key={slug}>
                  {index !== 0  &&
                    <Separator>|</Separator>
                  }
                  <li>
                    <StyledLink to={`/pages/${slug}`}>
                      <FormattedMessage {...messages[slug]} />
                    </StyledLink>
                  </li>
                </span>
              ))}
            </PagesNav>


            <PoweredBy href="https://www.citizenlab.co/">
              <span>{poweredBy}</span>
              <CitizenLabLogo name="logo" />
            </PoweredBy>
            <LanguageSelectionWrapper className={this.state.languageOptions.length > 1 ? 'show' : ''}>
              <Dropdown onChange={this.handleLanguageChange} upward={true} search={true} selection={true} value={locale} options={this.state.languageOptions} />
            </LanguageSelectionWrapper>
          </SecondLine>
        </Container>
      );
    }

    return null;
  }
}

export default Footer;
