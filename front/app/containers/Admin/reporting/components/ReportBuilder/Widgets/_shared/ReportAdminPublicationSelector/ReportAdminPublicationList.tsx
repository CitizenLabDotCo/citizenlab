import React, { useState, useMemo } from 'react';

import {
  Box,
  IconButton,
  Icon,
  Text,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAdminPublicationsByIds from 'api/admin_publications/useAdminPublicationsByIds';

import useLocalize from 'hooks/useLocalize';

import { buildTree, TreeNode, getAllDescendantIds } from './utils';

const ChevronIcon = styled(Icon)<{ $isExpanded: boolean }>`
  cursor: pointer;
  transition: transform 200ms ease-out;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
`;

const ItemRow = styled(Box)`
  padding: 8px 0;
  border-bottom: 1px solid ${colors.divider};
`;

interface Props {
  onChange: (newIds: string[]) => void;
  adminPublicationIds: string[];
}
interface TreeItemProps {
  node: TreeNode;
  depth: number;
  onDelete: (id: string) => void;
  localize: (multiloc: any) => string;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  depth,
  onDelete,
  localize,
  expandedIds,
  toggleExpanded,
}) => {
  const isFolder = node.relationships.publication.data.type === 'folder';
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const showChildren = isFolder && hasChildren && isExpanded;

  return (
    <>
      <ItemRow>
        <Box ml={`${depth * 32}px`} display="flex" alignItems="flex-start">
          <Box display="flex" flex="1" gap="8px">
            {isFolder && hasChildren ? (
              <Box
                onClick={() => toggleExpanded(node.id)}
                style={{ cursor: 'pointer' }}
              >
                <ChevronIcon
                  name="chevron-right"
                  $isExpanded={isExpanded}
                  fill={colors.textSecondary}
                />
              </Box>
            ) : (
              <Box width="24px" />
            )}
            <Icon
              name={isFolder ? 'folder-outline' : 'projects'}
              fill={colors.textSecondary}
              width="20px"
            />
            <Text m="0" color="textPrimary" style={{ flex: 1 }}>
              {localize(node.attributes.publication_title_multiloc)}
            </Text>
          </Box>
          <IconButton
            iconName="close"
            onClick={() => onDelete(node.id)}
            iconColor={colors.textSecondary}
            iconColorOnHover={colors.black}
            a11y_buttonActionMessage="Remove"
          />
        </Box>
      </ItemRow>
      {showChildren &&
        node.children.map((child) => (
          <TreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            onDelete={onDelete}
            localize={localize}
            expandedIds={expandedIds}
            toggleExpanded={toggleExpanded}
          />
        ))}
    </>
  );
};

const ReportAdminPublicationList = ({
  onChange,
  adminPublicationIds,
}: Props) => {
  const localize = useLocalize();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const {
    data: selectedAdminPublications,
    isLoading,
    isFetching,
  } = useAdminPublicationsByIds(
    {
      ids: adminPublicationIds,
    },
    {
      enabled: adminPublicationIds.length > 0,
      keepPreviousData: true,
    }
  );

  const adminPublications = useMemo(
    () =>
      adminPublicationIds.length > 0
        ? selectedAdminPublications?.pages.flatMap((page) => page.data) ?? []
        : [],
    [adminPublicationIds.length, selectedAdminPublications]
  );

  const tree = useMemo(
    () => buildTree(adminPublications),
    [adminPublications]
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (deletedId: string) => {
    const idsToDelete = [deletedId];
    const deletedItem = adminPublications.find((pub) => pub.id === deletedId);

    if (
      deletedItem &&
      deletedItem.relationships.publication.data.type === 'folder'
    ) {
      const descendantIds = getAllDescendantIds(deletedId, adminPublications);
      idsToDelete.push(...descendantIds);
    }

    onChange(adminPublicationIds.filter((id) => !idsToDelete.includes(id)));
  };

  if (adminPublications.length === 0) {
    return null;
  }

  return (
    <Box position="relative">
      {isFetching && !isLoading && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(255, 255, 255, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1"
        >
          <Spinner size="20px" color={colors.primary} />
        </Box>
      )}
      <Box>
        {tree.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            onDelete={handleDelete}
            localize={localize}
            expandedIds={expandedIds}
            toggleExpanded={toggleExpanded}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ReportAdminPublicationList;
