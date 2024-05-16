import React, { useState } from 'react';

import styled from 'styled-components';

import {
  Box,
  colors,
  fontSizes,
  Input,
  Title,
} from '@citizenlab/cl2-component-library';

import Error from 'components/UI/Error';

import useReport from 'api/reports/useReport';
import useUpdateReport from 'api/reports/useUpdateReport';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import reportTitleIsTaken from '../../../utils/reportTitleIsTaken';

const StyledInput = styled(Input)<{ errorBorder?: boolean }>`
  width: 500px;
  margin-right: 10px;

  input {
    border: none;
    padding: 2px;
    text-overflow: ellipsis;

    // Reproducing roughly the same style as: <Title variant="h3">
    // which is used for nameless reports (e.g. photo reports).
    font-size: ${fontSizes.xl}px;
    font-weight: bold;
    font-style: normal;
  }

  input.error,
  input:hover,
  input:focus {
    border: 1px solid;
  }

  input:focus,
  input:hover {
    border-color: ${colors.primary};
  }
`;

const StyledError = styled(Error)`
  height: 27px; // Same height as the input
`;

const ReportTitle = ({ reportId }) => {
  const { formatMessage } = useIntl();
  const { data: report } = useReport(reportId);
  const { mutateAsync: updateReport } = useUpdateReport();

  const reportTitle = report?.data.attributes.name;
  const [newTitle, setNewTitle] = useState(reportTitle);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const updateTitle = async () => {
    clearError();
    if (!newTitle || newTitle.trim() === reportTitle?.trim()) return;

    try {
      await updateReport({ id: reportId, name: newTitle });
    } catch (error) {
      if (reportTitleIsTaken(error)) {
        showError(formatMessage(messages.titleTaken));
      }
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.key === 'Enter') {
      // To save the new title, we just remove focus from the input. The onBlur event
      // will handle the rest. However, if the title is empty, enter does nothing.
      //
      // TODO: Ideally, we should find a way to keep the focus in the input if there is an error.
      // However, I could not find a elegant way to do it that does not send multiple
      // patch requests (one on enter, one on blur).
      if (newTitle) inputRef?.blur();
    }
  };

  const handleOnBlur = async () => {
    newTitle ? await updateTitle() : resetTitle();

    // Reset the cursor position to the beginning of the input in order to show the
    // beginning of the title in case it's too long to fit in the input.
    inputRef?.setSelectionRange(0, 0);
  };

  const resetTitle = () => setNewTitle(reportTitle);

  const showError = (message: string) => {
    setErrorMessage(message);
    inputRef?.classList.add('error');
  };

  const clearError = () => {
    setErrorMessage(null);
    inputRef?.classList.remove('error');
  };

  return reportTitle ? (
    <Box
      flexDirection="row"
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
    >
      <StyledInput
        type="text"
        value={newTitle}
        onChange={setNewTitle}
        onBlur={handleOnBlur}
        onKeyDown={handleOnKeyDown}
        setRef={setInputRef}
      />

      {errorMessage && <StyledError text={errorMessage} />}
    </Box>
  ) : (
    <Title variant="h3" as="h1" mb="0px" mt="0px">
      {formatMessage(messages.reportBuilder)}
    </Title>
  );
};

export default ReportTitle;
