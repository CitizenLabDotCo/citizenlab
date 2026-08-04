import { randomString } from '../support/commands';

interface Props {
  type?: 'timeline' | 'continuous';
  title?: string;
  descriptionPreview?: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
}

export default (folder: Props) => ({
  type: folder.type || 'continuous',
  title: folder.title || randomString(),
  descriptionPreview: folder.descriptionPreview || randomString(),
  publicationStatus: folder.publicationStatus || 'published',
});
