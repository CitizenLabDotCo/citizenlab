class CustomFieldPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    attr_reader :custom_form

    def initialize(user_context, scope, custom_form = nil)
      super(user_context, scope)
      @custom_form = custom_form
    end

    def resolve
      if user && UserRoleService.new.can_moderate?(custom_form&.participation_context, user)
        scope.all
      elsif !custom_form || policy_for(project).show?
        scope.not_hidden.enabled
      else
        scope.none
      end
    end
  end
end
