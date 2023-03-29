import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export function addIdeaImportFile(base64: string) {
  return streams.add(`${API_PATH}/import_ideas/bulk_create_xlsx`, {
    import_ideas: { xlsx: base64 },
  });
}
