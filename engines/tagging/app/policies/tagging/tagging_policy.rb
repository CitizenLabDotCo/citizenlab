module Tagging
  class TaggingPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active_admin_or_moderator?(record.idea.project.id)
          scope.all
        else
          scope.none
        end
      end
    end

    def create?
      user&.active_admin_or_moderator?(record.idea.project.id)
    end

    def show?
      user&.active_admin_or_moderator?(record.idea.project.id)
    end

    def permitted_attributes
      [
        :idea_id,
        :tag_id,
        tag_attributes: [
          title_multiloc: CL2_SUPPORTED_LOCALES
        ]
      ]
    end
  end
end
