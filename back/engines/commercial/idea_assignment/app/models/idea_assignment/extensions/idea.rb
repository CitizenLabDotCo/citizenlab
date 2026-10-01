# frozen_string_literal: true

module IdeaAssignment
  module Extensions
    module Idea
      def self.included(base)
        base.class_eval do
          belongs_to :assignee, class_name: 'User', optional: true
          validate :assignee_can_moderate_project, unless: :draft?

          scope :order_assignee, lambda { |direction = :asc|
            sql_direction = direction == :desc ? 'DESC' : 'ASC'
            assignee_name = ::User
              .where('users.id = ideas.assignee_id')
              .select(Arel.sql("LOWER(CONCAT_WS(' ', users.first_name, users.last_name))"))
            order(Arel.sql("(#{assignee_name.to_sql}) #{sql_direction} NULLS LAST, ideas.id"))
          }
        end
      end

      def assignee_can_moderate_project
        return unless assignee && project && !UserRoleService.new.can_moderate_project?(project, assignee)

        errors.add(
          :assignee_id,
          :assignee_can_not_moderate_project,
          message: 'The assignee can not moderate the project of this idea'
        )
      end
    end
  end
end
