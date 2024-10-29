# frozen_string_literal: true

class CustomFieldOptionImagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(custom_field_option: Pundit.policy_scope(user, CustomFieldOptionImage))
    end
  end

  def create?
    UserRoleService.new.moderates_something?(user)
  end

  def show?
    true
  end

  def update?
    if record.custom_field_option
      CustomFieldOptionPolicy.new(user, record.custom_field_option).update?
    else
      UserRoleService.new.moderates_something?(user)
    end
  end

  def destroy?
    if record.custom_field_option
      CustomFieldOptionPolicy.new(user, record.custom_field_option).update?
    else
      UserRoleService.new.moderates_something?(user)
    end
  end
end
