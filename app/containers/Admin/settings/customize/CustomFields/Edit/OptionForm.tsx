import * as React from 'react';
import styled from 'styled-components';
import { Form, Field, InjectedFormikProps } from 'formik';
import FormikInput from 'components/UI/FormikInput';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';

import Error from 'components/UI/Error';
import { SectionField } from 'components/admin/Section';
import Label from 'components/UI/Label';

import { FormattedMessage } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import messages from '../messages';
import Button from 'components/UI/Button';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

const OptionRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DeleteButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export interface FormValues {
  key: string;
  title_multiloc: Multiloc;
}

export interface Props {
  mode: 'new' | 'edit';
  onClickDelete: () => void;
}

class OptionForm extends React.Component<InjectedFormikProps<Props, FormValues>> {

  render() {

    const { mode, errors, onClickDelete, isSubmitting, isValid, touched } = this.props;

    return (
      <Form>
        <OptionRow>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.optionKey} />
            </Label>
            <Field
              name="key"
              component={FormikInput}
              disabled={mode === 'edit'}
            />
            <Error apiErrors={errors.key} />
          </SectionField>

          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.optionTitle} />}
            />
            <Error apiErrors={errors.title_multiloc} />
          </SectionField>

          {mode === 'edit' &&
            <DeleteButtonContainer>
              <Button
                onClick={onClickDelete}
                style="secondary"
                icon="delete"
              >
                <FormattedMessage {...messages.optionDeleteButton} />
              </Button>
            </DeleteButtonContainer>
          }

          <FormikSubmitWrapper
            {...{ isValid, isSubmitting, status, touched }}
          />

        </OptionRow>
      </Form>
    );
  }
}


export default OptionForm;
