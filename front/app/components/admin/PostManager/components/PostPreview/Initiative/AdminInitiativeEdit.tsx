import React, { useState, useEffect } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import InitiativesEditFormWrapper from 'containers/InitiativesEditPage/InitiativesEditFormWrapper';
import Button from 'components/UI/Button';
import { Box, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import { Top } from 'components/admin/PostManager/components/PostPreview';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';

// typings
import { Locale, UploadFile } from 'typings';

// hooks
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { useTheme } from 'styled-components';

export interface Props {
  initiativeId: string;
  goBack: () => void;
}

const AdminInitiativeEdit = ({ goBack, initiativeId }: Props) => {
  const theme = useTheme();
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeImages } = useInitiativeImages(initiativeId);

  useEffect(() => {
    async function getFiles() {
      let files: UploadFile[] = [];

      if (initiativeFiles) {
        files = (await Promise.all(
          initiativeFiles.data.map(async (file) => {
            const uploadFile = convertUrlToUploadFile(
              file.attributes.file.url,
              file.id,
              file.attributes.name
            );
            return uploadFile;
          })
        )) as UploadFile[];
      }
      setFiles(files);
    }

    getFiles();
  }, [initiativeFiles]);

  const onLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale);
  };

  useEffect(() => {
    !isNilOrError(locale) && setSelectedLocale(locale);
  }, [locale]);

  if (
    isNilOrError(tenantLocales) ||
    !selectedLocale ||
    isNilOrError(initiative) ||
    initiativeImages === undefined
  ) {
    return null;
  }

  return (
    <Box
      minHeight="100%"
      width="100%"
      position="relative"
      flexDirection="column"
      alignItems="center"
      bgColor="white"
      border="1px solid white"
      borderRadius={theme.borderRadius}
    >
      <Top>
        <Box width="100%" justifyContent="space-between" display="flex">
          <Box>
            <Button onClick={goBack}>
              <FormattedMessage {...messages.cancelEdit} />
            </Button>
          </Box>
          <Box my="auto" mr="8px">
            <LocaleSwitcher
              onSelectedLocaleChange={onLocaleChange}
              locales={tenantLocales}
              selectedLocale={selectedLocale}
            />
          </Box>
        </Box>
      </Top>
      <Box
        py="30px"
        px="35px"
        mt="0"
        width="100%"
        background={colors.background}
      >
        <InitiativesEditFormWrapper
          locale={selectedLocale}
          initiative={initiative.data}
          initiativeImage={
            initiativeImages.data.length === 0 ? null : initiativeImages.data[0]
          }
          onPublished={goBack}
          initiativeFiles={files}
        />
      </Box>
    </Box>
  );
};

export default AdminInitiativeEdit;
