export interface IAttachedFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string;
    };
    ordering: number | string | null;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
  };
}
