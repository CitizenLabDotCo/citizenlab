# frozen_string_literal: true

module ProjectFolders
  module Patches
    module User
      def self.prepended(base)
        base.singleton_class.prepend(ClassMethods)
        base.class_eval do
          scope :project_folder_moderator, lambda { |*project_folder_ids|
            return where("roles @> '[{\"type\":\"project_folder_moderator\"}]'") if project_folder_ids.empty?

            query = project_folder_ids.map do |id|
              { type: 'project_folder_moderator', project_folder_id: id }
            end

            where('roles @> ?', JSON.generate(query))
          }

          scope :not_project_folder_moderator, lambda { |*project_folder_ids|
            where.not(id: project_folder_moderator(*project_folder_ids))
          }
        end
      end

      module ClassMethods
        def enabled_roles
          super << 'project_folder_moderator'
        end
      end

      def project_folder_moderator?(project_folder_id = nil)
        project_folder_id ? moderated_project_folder_ids.include?(project_folder_id) : moderated_project_folder_ids.present?
      end

      def admin_or_folder_moderator?(project_folder_id = nil)
        admin? || (project_folder_id && project_folder_moderator?(project_folder_id))
      end

      def active_admin_or_folder_moderator?(project_folder_id = nil)
        active? && admin_or_folder_moderator?(project_folder_id)
      end

      def moderated_project_folders
        ProjectFolders::Folder.where(id: moderated_project_folder_ids)
      end

      def moderated_project_folder_ids
        roles.select { |role| role['type'] == 'project_folder_moderator' }.pluck("project_folder_id").compact
      end

      def moderates_parent_folder?(project)
        project.folder && project_folder_moderator?(project.folder.id)
      end
    end
  end
end
