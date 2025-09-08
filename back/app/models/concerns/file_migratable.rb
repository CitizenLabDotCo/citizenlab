# frozen_string_literal: true

# Temporary concern to help with migrating legacy files. This concern removes from the
# default scope any legacy files that have already been migrated to the new Files::File
# model. This allows for a non-destructive migration of legacy files to the new model and
# makes it possible to revert the migration if needed.
module FileMigratable
  extend ActiveSupport::Concern

  included do
    default_scope { where(migrated_file_id: nil, migration_skipped_reason: nil) }

    scope :migrated, -> { unscope(:where).where.not(migrated_file_id: nil) }
    scope :migration_skipped, -> { unscope(:where).where.not(migration_skipped_reason: nil) }

    belongs_to :migrated_file, class_name: 'Files::File', optional: true
  end

  # @return [Boolean] true if the file has been migrated
  def migrated?
    migrated_file_id.present?
  end

  def migration_skipped?
    migration_skipped_reason.present?
  end
end
