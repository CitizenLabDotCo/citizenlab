# frozen_string_literal: true

# Adds a `bulk_reorder!` class method for efficiently reordering all records
# in a scope with a single UPDATE query instead of per-record moves.
#
# Requires a DEFERRABLE unique constraint on the ordering column so that
# intermediate ordering conflicts are allowed within the transaction.
#
# Usage:
#   class CustomField < ApplicationRecord
#     include BulkReorderable
#     bulk_reorderable constraint_name: :custom_fields_resource_id_ordering_unique
#   end
#
#   @custom_form.custom_fields.bulk_reorder!([id3, id1, id2])
#
module BulkReorderable
  extend ActiveSupport::Concern

  class_methods do
    def bulk_reorderable(constraint_name:, ordering_column: :ordering)
      @_bulk_reorder_config = {
        ordering_column: ordering_column,
        constraint_name: constraint_name
      }
    end

    def bulk_reorder_config
      @_bulk_reorder_config || superclass.try(:bulk_reorder_config)
    end

    # Reorders records in the current scope to match the given ID sequence.
    #
    # - IDs not found in the scope are silently ignored.
    # - Records in the scope but missing from ordered_ids are appended at
    #   the end, preserving their existing relative order.
    # - Ordering values are reassigned as a zero-based contiguous sequence.
    def bulk_reorder!(ordered_ids)
      config = bulk_reorder_config
      raise "#{name} is not configured for bulk reordering. Call `bulk_reorderable` first." unless config

      column = config[:ordering_column]
      constraint = config[:constraint_name]

      ordered_ids = ordered_ids.compact.uniq

      existing_ids = all.order(column).pluck(:id)
      valid_ordered_ids = ordered_ids.select { |id| existing_ids.include?(id) }
      orphaned_ids = existing_ids - valid_ordered_ids
      final_order = valid_ordered_ids + orphaned_ids

      return if final_order == existing_ids

      quoted_column = connection.quote_column_name(column)
      case_clauses = final_order.map.with_index do |id, index|
        "WHEN #{connection.quote(id)} THEN #{index}"
      end

      transaction do
        connection.execute("SET CONSTRAINTS \"#{constraint}\" DEFERRED")

        where(id: final_order).update_all(
          "#{quoted_column} = CASE id #{case_clauses.join(' ')} END"
        )
      end
    end
  end
end
