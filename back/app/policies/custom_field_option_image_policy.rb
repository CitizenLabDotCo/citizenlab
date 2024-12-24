# frozen_string_literal: true

class CustomFieldOptionImagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(custom_field_option: scope_for(CustomFieldOptionImage))
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
      policy_for(record.custom_field_option).update?
    else
      UserRoleService.new.moderates_something?(user)
    end
  end

  def destroy?
    if record.custom_field_option
      policy_for(record.custom_field_option).update?
    else
      UserRoleService.new.moderates_something?(user)
    end
  end
end
