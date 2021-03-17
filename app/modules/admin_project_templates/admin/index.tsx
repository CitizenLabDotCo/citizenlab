import React, {
  lazy,
  Suspense,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import styled from 'styled-components';

// components
import Tabs, { ITabItem } from 'components/UI/Tabs';
import ProjectTemplates from './containers';
const AdminProjectEditGeneral = lazy(() =>
  import('containers/Admin/projects/edit/general')
);
// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

const StyledTabs = styled(Tabs)`
  margin-bottom: 25px;
`;

interface Props {}

const CreateProjectContainer = ({
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tabs: ITabItem[] = [
    {
      name: 'template',
      label: formatMessage(messages.fromATemplate),
      icon: 'template',
    },
    // {
    //   name: 'scratch',
    //   label: formatMessage(messages.fromScratch),
    //   icon: 'scratch',
    // },
  ];
  const [selectedTabValue, setSelectedTabValue] = useState(tabs[0].name);
  const isFirstRun = useRef(true);

  const handleTabOnClick = useCallback(
    (newSelectedTabValue: string) => {
      setSelectedTabValue(newSelectedTabValue);
    },
    [selectedTabValue]
  );

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (selectedTabValue === 'template') {
      trackEventByName(tracks.createProjectFromTemplateTabSelected);
    } else if (selectedTabValue === 'scratch') {
      trackEventByName(tracks.createProjectFromScratchTabSelected);
    }
  }, [selectedTabValue]);

  return (
    <>
      <StyledTabs
        className="e2e-create-project-tabs"
        items={tabs}
        selectedValue={selectedTabValue}
        onClick={handleTabOnClick}
      />
      {selectedTabValue === 'template' ? (
        <ProjectTemplates />
      ) : (
        <Suspense fallback={null}>
          <AdminProjectEditGeneral />
        </Suspense>
      )}
    </>
  );
};

export default injectIntl(CreateProjectContainer);
