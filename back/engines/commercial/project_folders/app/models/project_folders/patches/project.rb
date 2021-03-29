# frozen_string_literal: true

module ProjectFolders
  module Patches
    module Project
      def self.prepended(base)
        base.class_eval do
          attr_accessor :folder_changed, :folder_was

          after_save :reassign_moderators, if: :folder_changed?
          after_commit :clear_folder_changes, if: :folder_changed?
        end
      end

      def folder
        admin_publication&.parent&.publication
      end

      def saved_change_to_folder?
        admin_publication.saved_change_to_parent_id?
      end

      # rubocop:disable Metrics/CyclomaticComplexity
      def folder_id=(id)
        parent_id = AdminPublication.find_by(publication_type: 'ProjectFolders::Folder', publication_id: id)&.id
        raise ActiveRecord::RecordNotFound if id.present? && parent_id.nil?
        return unless folder&.admin_publication&.id != parent_id

        build_admin_publication unless admin_publication
        folder_will_change!
        admin_publication.assign_attributes(parent_id: parent_id)
      end

      # rubocop:enable Metrics/CyclomaticComplexity

      def folder_changed?
        folder_changed
      end

      def folder=(folder)
        self.folder_id = folder.id
      end

      def folder_will_change!
        self.folder_was = folder
        self.folder_changed = true
      end

      def clear_folder_changes
        self.folder_changed = false
      end

      private

      def reassign_moderators
        add_new_folder_moderators
        remove_old_folder_moderators
      end

      def add_new_folder_moderators
        new_folder_moderators.each do |moderator|
          next if moderator.moderatable_project_ids.include?(id)

          moderator.add_role('project_moderator', project_id: id)
          moderator.save
        end
      end

      def remove_old_folder_moderators
        old_folder_moderators.each do |moderator|
          next unless moderator.moderatable_project_ids.include?(id)

          moderator.delete_role('project_moderator', project_id: id)
          moderator.save
        end
      end

      def new_folder_moderators
        return ::User.none unless folder&.id

        ::User.project_folder_moderator(folder&.id)
      end

      def old_folder_moderators
        return ::User.none unless folder_was.is_a?(ProjectFolders::Folder)

        ::User.project_folder_moderator(folder_was.id)
      end
    end
  end
end
