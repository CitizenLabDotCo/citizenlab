import React, { useState } from 'react';

import { Box, Button, Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhaseMethodData, ParticipationMethod } from 'api/phases/types';
import useAddPhaseMethod from 'api/phases/useAddPhaseMethod';
import useDeletePhaseMethod from 'api/phases/useDeletePhaseMethod';
import usePhaseMethods from 'api/phases/usePhaseMethods';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

const ALL_METHODS: ParticipationMethod[] = [
  'ideation',
  'native_survey',
  'voting',
  'poll',
  'volunteering',
  'document_annotation',
  'proposals',
  'information',
];

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid ${colors.divider};
  border-radius: 6px;
  margin-bottom: 8px;
  background: ${colors.background};
`;

const RowLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${colors.textPrimary};
  text-transform: capitalize;
`;

const RowDates = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 200px 180px 180px auto;
  gap: 12px;
  align-items: end;
  margin-top: 8px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  color: ${colors.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NativeInput = styled.input`
  height: 36px;
  padding: 0 10px;
  border: 1px solid ${colors.borderDark};
  border-radius: 4px;
  font-size: 14px;
`;

const NativeSelect = styled.select`
  height: 36px;
  padding: 0 10px;
  border: 1px solid ${colors.borderDark};
  border-radius: 4px;
  font-size: 14px;
  background: white;
`;

const fmt = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

interface Props {
  phaseId: string;
}

const PhaseMethodsAdmin = ({ phaseId }: Props) => {
  const { data: methods } = usePhaseMethods(phaseId);
  const { mutate: addMethod, isLoading: adding } = useAddPhaseMethod();
  const { mutate: deleteMethod } = useDeletePhaseMethod();

  const [methodType, setMethodType] =
    useState<ParticipationMethod>('native_survey');
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');

  const handleAdd = () => {
    addMethod({
      phaseId,
      method_type: methodType,
      start_at: startAt ? new Date(startAt).toISOString() : null,
      end_at: endAt ? new Date(endAt).toISOString() : null,
    });
  };

  const handleDelete = (methodId: string) => {
    deleteMethod({ phaseId, phaseMethodId: methodId });
  };

  return (
    <Box className="e2e-phase-methods-admin" mt="32px">
      <SubSectionTitle>
        <Icon name="coin-stack" mr="8px" />
        Parallel participation methods
      </SubSectionTitle>
      <Box mb="12px" color={colors.textSecondary}>
        Add additional participation methods that run in parallel within this
        phase. Each method has its own start and end dates and may extend beyond
        the phase boundary.
      </Box>

      <SectionField>
        {methods && methods.length > 0 ? (
          methods.map((m: IPhaseMethodData) => (
            <Row
              key={m.id}
              className={`e2e-phase-method-row e2e-phase-method-row-${m.attributes.method_type}`}
            >
              <RowLabel>{m.attributes.method_type.replace(/_/g, ' ')}</RowLabel>
              <RowDates>
                {fmt(m.attributes.start_at)} – {fmt(m.attributes.end_at)}
              </RowDates>
              <Button
                buttonStyle="delete"
                size="s"
                icon="delete"
                onClick={() => handleDelete(m.id)}
                className="e2e-delete-phase-method"
              >
                Remove
              </Button>
            </Row>
          ))
        ) : (
          <Box color={colors.textSecondary} mb="12px">
            No phase methods configured yet. Add one below.
          </Box>
        )}
      </SectionField>

      <SectionField>
        <SubSectionTitle>Add a method</SubSectionTitle>
        <FormGrid>
          <FieldLabel>
            Method
            <NativeSelect
              className="e2e-phase-method-type"
              value={methodType}
              onChange={(e) =>
                setMethodType(e.target.value as ParticipationMethod)
              }
            >
              {ALL_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, ' ')}
                </option>
              ))}
            </NativeSelect>
          </FieldLabel>
          <FieldLabel>
            Start
            <NativeInput
              className="e2e-phase-method-start"
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </FieldLabel>
          <FieldLabel>
            End
            <NativeInput
              className="e2e-phase-method-end"
              type="date"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </FieldLabel>
          <Button
            buttonStyle="primary"
            size="m"
            onClick={handleAdd}
            processing={adding}
            className="e2e-add-phase-method"
          >
            Add method
          </Button>
        </FormGrid>
      </SectionField>
    </Box>
  );
};

export default PhaseMethodsAdmin;
