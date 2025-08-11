# frozen_string_literal: true

module Files
  # Service to migrate legacy file records to the new Files::File system
  #
  # This service handles the migration of legacy file models (IdeaFile, ProjectFile,
  # EventFile, PhaseFile, StaticPageFile, ProjectFolders::File) to the new unified
  # Files::File and Files::FileAttachment system.
  #
  # Usage:
  #   # Migrate all legacy files
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

    def migrate_all
      LEGACY_FILE_ASSOCIATIONS.keys.each do |container_class|
        migrate_container_class(container_class)
      end
    end

    def migrate_container_class(container_class)
      legacy_file_association = LEGACY_FILE_ASSOCIATIONS.fetch(container_class)

      container_class.where.associated(legacy_file_association).find_each do |container|
        migrate_container(container)
      end
    end

    def migrate_container(container)
      legacy_file_association = LEGACY_FILE_ASSOCIATIONS.fetch(container.class)

      Files::File.transaction do
        container.send(legacy_file_association).find_each do |legacy_file|
          migrate_legacy_file(container, legacy_file)
        end

        Rails.logger.info 'Migrated legacy file', legacy_file: legacy_file.id, file: file.id, container: container.id, container_class: container.class
      rescue RemoteFileMissingError
        Rails.logger.error 'Skipping file with missing content', legacy_file: legacy_file.id, container: container.id, container_class: container.class
      end
    end

    private

    # Migrate a single legacy file. It is private because we want to migrate all the files for a container at once, transactionally.
    # So, this method is not intended to be called directly.
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

    def update_idea_cf_values!(idea, legacy_file_id, attachment_id)
      idea.custom_field_values.transform_values! do |value|
        value.merge('id' => attachment_id) if value['id'] == legacy_file_id
      end

      idea.save!
    end

    class RemoteFileMissingError < StandardError; end
  end
end
