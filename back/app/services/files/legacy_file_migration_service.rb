# frozen_string_literal: true

module Files
  # Service to migrate legacy file records to the new Files::File system
  #
  # This service handles the migration of legacy file models (IdeaFile, ProjectFile,
  # EventFile, PhaseFile, StaticPageFile, ProjectFolders::File) to the new unified
  # Files::File and Files::FileAttachment system.
  #
  # Usage:
  #   # Migrate all legacy files (all tenants)
  #   Files::LegacyFileMigrationService.new.migrate_all_tenants
  #
  #   # Migrate all legacy files (current tenant)
  #   Files::LegacyFileMigrationService.new.migrate_all
  #
  #   # Migrate files for a specific container
  #   Files::LegacyFileMigrationService.new.migrate_container(project)
  #
  class LegacyFileMigrationService
    LEGACY_FILE_ASSOCIATIONS = {
      Idea => :idea_files,
      Project => :project_files,
      Event => :event_files,
      Phase => :phase_files,
      ProjectFolders::Folder => :files,
      StaticPage => :static_page_files
    }.freeze

    LEGACY_FILE_CLASSES = [
      IdeaFile,
      ProjectFile,
      EventFile,
      PhaseFile,
      StaticPageFile,
      ProjectFolders::File
    ].freeze

    attr_reader :logger

    def initialize(logger: Rails.logger)
      @logger = logger
    end

    def migrate_all_tenants
      stats = Statistics.new

      Tenant.not_deleted.each do |tenant|
        tenant.switch { migrate_all(stats: stats) }
      end

      stats
    end

    def migrate_all(stats: Statistics.new)
      LEGACY_FILE_ASSOCIATIONS.each_key do |container_class|
        migrate_container_class(container_class, stats: stats)
      end

      stats
    end

    def migrate_container_class(container_class, stats: Statistics.new)
      legacy_file_association = LEGACY_FILE_ASSOCIATIONS.fetch(container_class)

      container_class.where.associated(legacy_file_association).distinct.find_each do |container|
        migrate_container(container, stats: stats)
      end

      stats
    end

    def migrate_container(container, stats: Statistics.new)
      legacy_file_association = LEGACY_FILE_ASSOCIATIONS.fetch(container.class)

      Files::File.transaction do
        files_migrated = 0
        files_skipped = 0

        container.send(legacy_file_association).find_each do |legacy_file|
          migrate_legacy_file(container, legacy_file)
        rescue RemoteFileMissingError
          logger.error('Skipping file with missing content', log_payload(container, legacy_file))
          legacy_file.update_column(:migration_skipped_reason, 'File content missing')
          files_skipped += 1
        rescue StandardError => e
          error_details = log_payload(container, legacy_file, error_class: e.class.name, error_msg: e.message)
          stats.errors << error_details
          logger.error('Failed to migrate legacy file', error_details, e)
          raise ActiveRecord::Rollback
        else
          logger.info('Migrated legacy file', log_payload(container, legacy_file))
          files_migrated += 1
        end

        stats.files_skipped += files_skipped
        stats.files_migrated += files_migrated
        stats.containers_migrated += 1
        logger.info('Migrated all legacy files for container', log_payload(container))
      end

      stats
    end

    def revert(legacy_file_class)
      unless legacy_file_class.in?(LEGACY_FILE_CLASSES)
        raise "Invalid legacy file class: #{legacy_file_class}"
      end

      legacy_files = legacy_file_class.unscope(:where)

      if legacy_file_class == IdeaFile
        legacy_files
          .where.not(migration_skipped_reason: nil)
          .update_all(migration_skipped_reason: nil)

        legacy_files.where.not(migrated_file_id: nil).find_each do |idea_file|
          idea_file.transaction do
            attachment = idea_file.migrated_file.attachments.sole
            update_idea_cf_values!(idea_file.idea, attachment.id, idea_file.id)
            idea_file.update!(migrated_file_id: nil, migration_skipped_reason: nil)
          end
        end
      else
        legacy_files.update_all(migrated_file_id: nil, migration_skipped_reason: nil)
      end
    end

    def revert_all_tenants
      Tenant.all.each do |tenant|
        tenant.switch { revert_all }
      end
    end

    def revert_all
      LEGACY_FILE_CLASSES.each { |legacy_file_class| revert(legacy_file_class) }
    end

    private

    # Migrate a single legacy file. It is private because we want to migrate all the files
    # for a container at once, transactionally. So, this method is not intended to be
    # called directly.
    def migrate_legacy_file(container, legacy_file)
      file = Files::File.new(
        name: legacy_file.name,
        content: legacy_file.file,
        uploader: (container.author if container.is_a?(Idea)),
        created_at: legacy_file.created_at
      )

      raise RemoteFileMissingError if file.content.blank?

      attachment = file.attachments.build(
        position: legacy_file.ordering,
        attachable: container
      )

      if (project = container.try(:project))
        file.files_projects.build(project: project)
      end

      file.save!

      update_idea_cf_values!(container, legacy_file.id, attachment.id) if container.is_a?(Idea)
      legacy_file.update!(migrated_file: file)
    end

    def update_idea_cf_values!(idea, from_id, to_id)
      idea.custom_field_values.each_value do |value|
        value['id'] = to_id if value.is_a?(Hash) && value['id'] == from_id
      end

      idea.save!
    end

    class Statistics
      attr_accessor :containers_migrated, :files_migrated, :files_skipped, :errors

      def initialize
        @containers_migrated = 0
        @files_migrated = 0
        @files_skipped = 0
        @errors = []
      end

      def containers_failed
        errors.pluck(:container_id).uniq.count
      end
    end

    class RemoteFileMissingError < StandardError; end

    def log_payload(container = nil, legacy_file = nil, **kwargs)
      payload = { tenant_id: Tenant.current.id, tenant_host: Tenant.current.host }

      if container
        payload[:container_type] = container.class.name
        payload[:container_id] = container.id
      end

      if legacy_file
        payload[:legacy_file_type] = legacy_file.class.name
        payload[:legacy_file_id] = legacy_file.id
        payload[:legacy_file_path] = legacy_file.file.path
      end

      payload.merge!(kwargs)
    end
  end
end
