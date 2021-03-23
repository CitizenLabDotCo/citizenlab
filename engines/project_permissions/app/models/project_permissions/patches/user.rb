# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module User
      def self.prepended(base)
        base.class_eval do
          scope :project_moderator, -> (project_id = nil) {
            if project_id
              where("roles @> ?", JSON.generate([{ type: 'project_moderator', project_id: project_id }]))
            else
              where("roles @> '[{\"type\":\"project_moderator\"}]'")
            end
          }

          scope :not_project_moderator, -> {
            where.not("roles @> '[{\"type\":\"project_moderator\"}]'")
          }
        end
      end

      def moderatable_project_ids
        self.roles
            .select { |role| role['type'] == 'project_moderator' }
            .map { |role| role['project_id'] }.compact
      end

      def project_moderator?(project_id = nil)
        project_id ? moderatable_project_ids.include?(project_id) : roles.pluck('type').include?('project_moderator')
      end
    end
  end
end