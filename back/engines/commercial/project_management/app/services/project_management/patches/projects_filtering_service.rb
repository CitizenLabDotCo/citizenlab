# frozen_string_literal: true

module ProjectManagement
  module Patches
    module ProjectsFilteringService
      def self.included(base)
        base.class_eval do
          add_filter('by_moderator') do |scope, options|
            next scope unless options.key? :moderator

            moderator = options[:moderator] # nil means the user is not logged in
            UserRoleService.new.moderatable_projects moderator, scope
          end
        end
      end
    end
  end
end
