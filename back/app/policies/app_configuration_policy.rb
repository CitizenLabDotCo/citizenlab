# frozen_string_literal: true

class AppConfigurationPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.none
    end
  end

  def show?
    true
  end

  def update?
    user&.active? && user.admin?
  end

  # @param changed [Array<Array(String, String)>] the [feature, setting] pairs whose value changes.
  # @return [Array<Array(String, String)>] the pairs this user may not change.
  def forbidden_settings(changed)
    return [] if user&.super_admin?

    changed - SettingsService.new.admin_writable_settings(AppConfiguration::Settings.json_schema)
  end

  def create?
    false
  end

  def destroy?
    false
  end
end
