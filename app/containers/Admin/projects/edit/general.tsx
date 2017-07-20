// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// Store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// Services
import { observeProject, IProjectData } from 'services/projects';

// Components
import Input from 'components/UI/Input';
import Editor from 'components/UI/Editor';
import Upload from 'components/UI/Upload';

// Component typing
type Props = {
  lang: string,
  params: {
    slug: string | null,
  },
  userLocale: string,
  tenantLocales: string[],
};

type State = {
  project: IProjectData | null,
  uploadedImages: any,
};

class AdminProjectEditGeneral extends React.Component<Props, State> {
  subscription: Rx.Subscription;

  constructor() {
    super();

    this.state = {
      project: null,
      uploadedImages: []
    };
  }

  componentDidMount() {
    if (this.props.params.slug) {
      this.subscription = observeProject(this.props.params.slug).observable.subscribe((project) => {
        this.setState({ project: project.data });
      });
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setRef = (element) => {

  }

  changeTitle = (value) => {
    const newVal = _.set({}, `project.attributes.title_multiloc.${this.props.userLocale}`, value);
    this.setState(_.merge({}, this.state, newVal));
  }

  changeDesc = (value) => {
    console.log(value);
  }

  handleUploadOnAdd = () => {
    console.log(arguments);
  }

  handleUploadOnRemove = () => {
    console.log(arguments);
  }


  render() {
    const { project, uploadedImages } = this.state;
    const { userLocale } = this.props;

    return (
      <div>
        <label htmlFor="">Title</label>
        <Input
          type="text"
          placeholder=""
          value={project ? project.attributes.title_multiloc[userLocale] : ''}
          error=""
          onChange={this.changeTitle}
          setRef={this.setRef}
        />

        <label htmlFor="">Description</label>
        <Editor
          placeholder=""
          value={project ? project.attributes.description_multiloc[userLocale] : ''}
          error=""
          onChange={this.changeDesc}
        />

        <label>Header image</label>
        <Upload
          items={uploadedImages}
          accept="image/jpg, image/jpeg, image/png, image/gif"
          maxSize={5000000}
          maxItems={1}
          placeholder="Upload images"
          onAdd={this.handleUploadOnAdd}
          onRemove={this.handleUploadOnRemove}
        />

      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
  tenantLocales: makeSelectSetting(['core', 'locales']),
});

export default connect(mapStateToProps)(AdminProjectEditGeneral);
