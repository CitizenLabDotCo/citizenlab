import React, { PureComponent } from 'react';

// components
import Label from 'components/UI/Label';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { Section, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// utils
import { convertUrlToFile } from 'utils/imageTools';
import getSubmitState from 'utils/getSubmitState';

// services
import { updateTenant, IUpdatedTenantProperties } from 'services/tenant';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// intl
import messages from './messages';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';

// utils
import { isNilOrError } from 'utils/helperUtils';
// styling
import styled from 'styled-components';

const MainDropzone = styled(ImagesDropzone)`
  margin-top : 20px;
`;
const Preview = styled(ImagesDropzone)`
  margin-top : 20px;
  .remove-button {
    display: none;
  }
  * {
    border-radius: 0;
  }
`;

// typings
import { API, ImageFile } from 'typings';

interface IAttributesDiff {
  favicon?: string;
}

interface Props {
  tenant: GetTenantChildProps;
}

type State = {
  attributesDiff: IAttributesDiff;
  errors: { [fieldName: string]: API.Error[] };
  favicon: ImageFile[] | null;
  faviconError: string | null;
  saved: boolean;
  loading: boolean;
};

class Favicon extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      attributesDiff: {},
      errors: {},
      favicon: null,
      faviconError: null,
      saved: false,
      loading: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { tenant } = this.props;

    if (prevProps.tenant !== tenant && !isNilOrError(tenant)) {
      if (tenant.attributes.favicon && tenant.attributes.favicon.large) {
        convertUrlToFile(tenant.attributes.favicon.large)
          .then((res) => {
            if (res) this.setState({ favicon: [res] });
          });
      }
    }
  }

  handleUploadOnAdd = (newImage: ImageFile) => {
    this.setState({ attributesDiff: { favicon: newImage.base64 as string }, favicon: [newImage] });
  }

  handleUploadOnUpdate = (updatedImages: ImageFile[]) => {
    this.setState({ favicon: updatedImages });
  }

  handleUploadOnRemove = () => {
    this.setState({ attributesDiff: {}, favicon: null });
  }

  save = async (event) => {
    event.preventDefault();
    const { tenant } = this.props;

    if (!isNilOrError(tenant)) {
      this.setState({ loading: true, saved: false });

      try {
        await updateTenant(tenant.id, this.state.attributesDiff as IUpdatedTenantProperties);
        this.setState({ loading: false, saved: true, attributesDiff: {} });
      } catch (error) {
        this.setState({ loading: false, errors: error.json.errors });
      }
    }
  }

  render() {
    const { errors, saved } = this.state;
    const { tenant } = this.props;

    if (!isNilOrError(tenant)) {
      const { attributesDiff, faviconError, favicon } = this.state;

      return (
        <form onSubmit={this.save}>

          <Section>
            <SectionField key={'favicon'}>
              <Label>Favicon</Label>
              <FormattedMessage  {...messages.faviconExplaination}/>
              <MainDropzone
                acceptedFileTypes="image/png"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={favicon}
                imagePreviewRatio={1}
                maxImagePreviewWidth="152px"
                objectFit="contain"
                onAdd={this.handleUploadOnAdd}
                onUpdate={this.handleUploadOnUpdate}
                onRemove={this.handleUploadOnRemove}
                placeholder="Drop file here"
                errorMessage={faviconError}
              />
              <Preview
                acceptedFileTypes="image/png"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={favicon}
                imagePreviewRatio={1}
                maxImagePreviewWidth="32px"
                objectFit="contain"
                onAdd={this.handleUploadOnAdd}
                onUpdate={this.handleUploadOnUpdate}
                onRemove={this.handleUploadOnRemove}
                placeholder=" "
                errorMessage={faviconError}
              />
              <Preview
                acceptedFileTypes="image/png"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={favicon}
                imagePreviewRatio={1}
                maxImagePreviewWidth="16px"
                objectFit="contain"
                onAdd={this.handleUploadOnAdd}
                onUpdate={this.handleUploadOnUpdate}
                onRemove={this.handleUploadOnRemove}
                placeholder=" "
                errorMessage={faviconError}
              />
            </SectionField>
          </Section>

          <SubmitWrapper
            loading={this.state.loading}
            status={getSubmitState({ errors, saved, diff: attributesDiff })}
            messages={{
              buttonSave: messages.save,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />

        </form>
      );
    }

    return null;
  }
}

export default () => (<GetTenant>{tenant => (<Favicon tenant={tenant} />)}</GetTenant>);
