# frozen_string_literal: true

module AdminPublications
  # Detects and repairs `lft`/`rgt` drift in the tenant-wide `admin_publications`
  # nested set (TAN-8089).
  #
  # awesome_nested_set deletes descendants by the `lft`/`rgt` window, not by
  # `parent_id`. When those bounds drift out of sync with `parent_id` (concurrent
  # reorder/move races), a normal Project/Folder destroy cascade-deletes the
  # `admin_publication` of an *unrelated* publication that happens to sit inside
  # the stale window, leaving that publication orphaned.
  #
  # `parent_id` is the reliable dimension, so `AdminPublication.rebuild!`
  # (which recomputes `lft`/`rgt` from `parent_id`) fully repairs the tree.
  #
  # Used in two places:
  #   * `AdminPublication`'s destroy guard (`guard_destroy!`) — repairs, or fails
  #     closed, before the cascade so a delete can never orphan a publication.
  #   * the `admin_publications:*` rake tasks — scan and bulk repair.
  module NestedSetIntegrity
    class DriftError < StandardError; end

    # Distinct advisory-lock namespace (TAN-8089) so we never collide with other
    # advisory locks; the second key scopes the lock per tenant schema.
    ADVISORY_LOCK_NAMESPACE = 8089

    # Every (container, victim) pair where destroying `container` would wrongly
    # cascade-delete `victim`: victim sits inside container's lft/rgt window but
    # isn't its parent_id-child.
    DRIFT_COUNT_SQL = <<~SQL.squish.freeze
      SELECT COUNT(*) AS pairs, COUNT(DISTINCT victim.id) AS victims
      FROM admin_publications victim
      JOIN admin_publications container
        ON victim.lft > container.lft AND victim.lft < container.rgt AND container.id <> victim.id
      WHERE victim.parent_id IS DISTINCT FROM container.id
    SQL

    module_function

    # ---- detection ----------------------------------------------------------

    # True when destroying this node would orphan an unrelated publication: some
    # node sits inside its lft/rgt window (so the cascade would delete it) but is
    # NOT its parent_id-child (so it isn't really part of this subtree). Mirrors
    # the rake's DRIFT_COUNT_SQL. Folders never nest and projects are leaves, so a
    # node's parent_id-descendants are exactly its direct children.
    #
    # The reverse inconsistency (a child whose bounds fall outside its parent) is
    # not flagged: it can't be orphaned by *this* destroy (the cascade won't reach
    # it), so there's nothing to repair here.
    def node_drifted?(node)
      return false if node.lft.nil? || node.rgt.nil?

      bounds_ids = AdminPublication.where('lft > ? AND lft < ?', node.lft, node.rgt).pluck(:id).to_set
      return false if bounds_ids.empty? # cascade would delete nothing

      child_ids = AdminPublication.where(parent_id: node.id).pluck(:id).to_set
      (bounds_ids - child_ids).any?
    end

    # [pairs, victims] for the current tenant.
    def drift_counts
      row = AdminPublication.connection.exec_query(DRIFT_COUNT_SQL).first
      [row['pairs'].to_i, row['victims'].to_i]
    end

    # [orphaned_projects, orphaned_folders] for the current tenant.
    def orphan_counts
      [
        Project.where.missing(:admin_publication).count,
        ProjectFolders::Folder.where.missing(:admin_publication).count
      ]
    end

    # ---- repair -------------------------------------------------------------

    # Rebuild the whole tenant tree from `parent_id`, serialized per tenant so
    # concurrent reorders can't race the rebuild. Must be called inside a
    # transaction (the advisory lock is transaction-scoped); returns whether the
    # resulting tree is valid.
    def repair!
      AdminPublication.transaction do
        rebuild_locked!
      end
      AdminPublication.valid?
    end

    # Acquire the per-tenant advisory lock (bound to the *current* transaction)
    # then rebuild. Use this from code already running inside a transaction, such
    # as the destroy guard.
    def rebuild_locked!
      AdminPublication.connection.execute(
        "SELECT pg_advisory_xact_lock(#{ADVISORY_LOCK_NAMESPACE}, #{tenant_lock_key})"
      )
      AdminPublication.rebuild!(false)
    end

    # ---- destroy guard ------------------------------------------------------

    # Runs before the nested-set cascade. If the node about to be destroyed is
    # drifted, repair the tree in place and let the (now-correct) cascade
    # proceed. If repair can't reconcile it (e.g. parent_id itself is corrupt),
    # raise so the destroy aborts rather than orphaning unrelated publications.
    def guard_destroy!(node)
      return unless node_drifted?(node)

      ErrorReporter.report_msg(
        'admin_publications nested-set drift detected before destroy; rebuilding tree',
        extra: {
          admin_publication_id: node.id,
          publication_type: node.publication_type,
          publication_id: node.publication_id,
          lft: node.lft,
          rgt: node.rgt,
          tenant_host: Tenant.safe_current&.host
        }
      )

      rebuild_locked!
      node.reload

      return unless node_drifted?(node)

      raise DriftError,
        "admin_publications nested set still inconsistent for #{node.id} after rebuild; " \
        'aborting destroy to avoid orphaning unrelated publications'
    end

    # A stable signed-int4 key derived from the current tenant schema, so the
    # advisory lock serializes rebuilds within a tenant but not across tenants.
    def tenant_lock_key
      schema = AdminPublication.connection.schema_search_path.to_s
      [Zlib.crc32(schema)].pack('L').unpack1('l')
    end
  end
end
