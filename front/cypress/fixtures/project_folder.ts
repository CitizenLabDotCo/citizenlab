import { randomString } from '../support/commands';

interface Props {
  type?: 'timeline' | 'continuous';
  title?: string;
  descriptionPreview?: string;
  description?: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
}

export default (folder: Props) => ({
  type: folder.type || 'continuous',
  title: folder.title || randomString(),
  descriptionPreview: folder.descriptionPreview || randomString(),
  description: folder.description || randomString(),
  publicationStatus: folder.publicationStatus || 'published',
});
