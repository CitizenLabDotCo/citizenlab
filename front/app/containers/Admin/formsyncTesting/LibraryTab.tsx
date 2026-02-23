import React, { useState } from 'react';

import {
  Box,
  Text,
  Button,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useDeleteFormsyncBenchmark from 'api/import_ideas/useDeleteFormsyncBenchmark';
import useFormsyncBenchmarks from 'api/import_ideas/useFormsyncBenchmarks';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid ${colors.grey200};
  }

  th {
    font-weight: 600;
    font-size: 13px;
    color: ${colors.textSecondary};
    background: ${colors.grey100};
  }

  td {
    font-size: 14px;
  }

  tr {
    background: white;
  }
  tr:hover td {
    background: ${colors.grey100};
  }
`;

const TypeBadge = styled.code`
  font-size: 11px;
  background: ${colors.grey200};
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 4px;
`;

interface Props {
  onEvaluate: (benchmarkId: string, locale: string) => void;
}

const LibraryTab = ({ onEvaluate }: Props) => {
  const { data, isLoading } = useFormsyncBenchmarks();
  const { mutateAsync: deleteBenchmark, isLoading: isDeleting } =
    useDeleteFormsyncBenchmark();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, locale: string) => {
    if (!window.confirm(`Delete benchmark "${id}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteBenchmark({ id, locale });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p="40px">
        <Spinner />
      </Box>
    );
  }

  const benchmarks = data?.benchmarks ?? [];

  if (benchmarks.length === 0) {
    return (
      <Box p="40px" style={{ textAlign: 'center' }}>
        <Text color="textSecondary" fontSize="l">
          No benchmarks saved yet.
        </Text>
        <Text color="textSecondary" mt="8px">
          Run a test in the Test tab and save it as a benchmark to get started.
        </Text>
      </Box>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Locale</th>
          <th>Pages</th>
          <th>Questions</th>
          <th>Types</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {benchmarks.map((b) => (
          <tr key={`${b.locale}-${b.id}`}>
            <td>
              <Text fontWeight="bold">{b.name}</Text>
            </td>
            <td>
              <code>{b.locale}</code>
            </td>
            <td>{b.page_count ?? '—'}</td>
            <td>{b.question_count}</td>
            <td>
              {b.question_types.map((t) => (
                <TypeBadge key={t}>{t}</TypeBadge>
              ))}
            </td>
            <td>
              <Text fontSize="s" color="textSecondary">
                {new Date(b.created_at).toLocaleDateString()}
              </Text>
            </td>
            <td>
              <Box display="flex" gap="8px">
                <Button
                  bgColor={colors.primary}
                  width="auto"
                  padding="4px 12px"
                  onClick={() => onEvaluate(b.id, b.locale)}
                >
                  Evaluate
                </Button>
                <Button
                  buttonStyle="secondary-outlined"
                  width="auto"
                  padding="4px 12px"
                  onClick={() => handleDelete(b.id, b.locale)}
                  processing={isDeleting && deletingId === b.id}
                >
                  Delete
                </Button>
              </Box>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default LibraryTab;
