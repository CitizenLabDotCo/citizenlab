import { ICustomFieldOptionImage } from 'api/content_field_option_images/types';
import { ICustomFieldOptionData } from 'api/custom_field_options/types';
import { IFormCustomFieldStatementData } from 'api/custom_field_statements/types';

import { groupIncludedResources } from 'utils/cl-react-query/groupIncludedResources';

import {
  IFlatCustomField,
  IOptionsType,
  IMatrixStatementsType,
  ICustomFields,
} from './types';

export const constructFlatCustomFields = (rawCustomFields: ICustomFields) => {
  if (!rawCustomFields.included) return undefined;
  const includedByType = groupIncludedResources(rawCustomFields.included);

  const options = includedByType.custom_field_option ?? [];
  const images = includedByType.image ?? [];
  const statements = includedByType.custom_field_matrix_statement ?? [];

  const optionsByCustomFieldId = groupOptionsByCustomFieldId(
    options,
    rawCustomFields
  );

  const statementsByCustomFieldId = groupStatementsByCustomFieldId(
    statements,
    rawCustomFields
  );

  const imagesById = groupImagesById(images);

  const flatCustomFields: IFlatCustomField[] | undefined =
    rawCustomFields.data.map((customField) => {
      const optionsForCustomField = optionsByCustomFieldId[customField.id];

      const optionsConverted = convertOptions(
        optionsForCustomField,
        imagesById
      );

      const statementsForCustomField =
        statementsByCustomFieldId[customField.id];

      const statementsConverted = convertStatements(statementsForCustomField);

      return {
        ...customField,
        ...customField.attributes,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        map_config: customField.relationships?.map_config,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        map_config_id: customField.relationships?.map_config?.data?.id,
        options: optionsConverted,
        matrix_statements: statementsConverted,
      };
    });

  return flatCustomFields;
};

const groupOptionsByCustomFieldId = (
  options: ICustomFieldOptionData[],
  rawCustomFields: ICustomFields
) => {
  const optionsById = options.reduce((acc, option) => {
    const id = option.id;
    acc[id] = option;
    return acc;
  }, {} as Record<string, ICustomFieldOptionData>);

  const optionsByCustomFieldId = rawCustomFields.data.reduce(
    (acc, customField) => {
      const options = customField.relationships.options?.data ?? [];
      const optionIds = options.map((option) => option.id);

      acc[customField.id] = optionIds.map((id) => optionsById[id]);
      return acc;
    },
    {} as Record<string, ICustomFieldOptionData[]>
  );

  return optionsByCustomFieldId;
};

const groupStatementsByCustomFieldId = (
  statements: IFormCustomFieldStatementData[],
  rawCustomFields: ICustomFields
) => {
  const statementsById = statements.reduce((acc, statement) => {
    const id = statement.id;
    acc[id] = statement;
    return acc;
  }, {} as Record<string, IFormCustomFieldStatementData>);

  const statementsByCustomFieldId = rawCustomFields.data.reduce(
    (acc, customField) => {
      const statements =
        customField.relationships.matrix_statements?.data ?? [];
      const statementIds = statements.map((statement) => statement.id);

      acc[customField.id] = statementIds.map((id) => statementsById[id]);
      return acc;
    },
    {} as Record<string, IFormCustomFieldStatementData[]>
  );

  return statementsByCustomFieldId;
};

type ImagesById = Record<string, ICustomFieldOptionImage['data']>;

const groupImagesById = (images: ICustomFieldOptionImage['data'][]) => {
  return images.reduce((acc, image) => {
    const id = image.id;
    acc[id] = image;
    return acc;
  }, {} as ImagesById);
};

const convertOptions = (
  options: ICustomFieldOptionData[],
  imagesById: ImagesById
): IOptionsType[] => {
  return options.map((option) => {
    const image_id = option.relationships.image?.data?.id;

    return {
      id: option.id,
      key: option.attributes.key,
      title_multiloc: option.attributes.title_multiloc,
      other: option.attributes.other || false,
      image_id,
      image: image_id ? imagesById[image_id] : undefined,
      temp_id: option.attributes.temp_id,
    };
  });
};

const convertStatements = (
  statements: IFormCustomFieldStatementData[]
): IMatrixStatementsType[] => {
  return statements.map((statement) => ({
    id: statement.id,
    key: statement.attributes.key,
    title_multiloc: statement.attributes.title_multiloc,
    temp_id: statement.attributes.temp_id,
  }));
};
