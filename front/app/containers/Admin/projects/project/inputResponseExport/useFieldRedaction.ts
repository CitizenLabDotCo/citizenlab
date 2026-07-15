import { useMemo, useState } from 'react';

import useInputResponseFields from 'api/input_response_fields/useInputResponseFields';

import { RedactionField } from './types';

// The field include/exclude state of a responses export: every field of the
// export with its redaction flag (personal-data fields are excluded by
// default; the admin can toggle any field). Shared by the PDF and XLSX export
// modals.
const useFieldRedaction = (phaseId: string) => {
  const {
    data: responseFields,
    isLoading,
    isError,
  } = useInputResponseFields({ phaseId });

  const [redactOverrides, setRedactOverrides] = useState<
    Record<string, boolean>
  >({});

  const fields: RedactionField[] = useMemo(
    () =>
      (responseFields?.data ?? []).map((field) => ({
        key: field.id,
        label: field.attributes.title,
        redact: redactOverrides[field.id] ?? field.attributes.personal_data,
      })),
    [responseFields, redactOverrides]
  );

  const toggleField = (key: string) => {
    const current = fields.find((field) => field.key === key)?.redact ?? false;
    setRedactOverrides((prev) => ({ ...prev, [key]: !current }));
  };

  const redactedFieldKeys = fields
    .filter((field) => field.redact)
    .map((field) => field.key);

  return { fields, toggleField, redactedFieldKeys, isLoading, isError };
};

export default useFieldRedaction;
