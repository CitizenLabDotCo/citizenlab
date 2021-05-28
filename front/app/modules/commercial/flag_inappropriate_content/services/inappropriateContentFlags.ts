interface IInappropriateContentFlagData {
  flaggable_type: string;
  flaggable_id: string;
  deleted_at: string;
  toxicity_label: string | null;
}

interface IInappropriateContentFlag {
  data: IInappropriateContentFlagData;
}
