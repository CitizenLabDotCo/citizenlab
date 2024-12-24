# frozen_string_literal: true

class NavBarItemPolicy < ApplicationPolicy
  FEATURES_CODES = { 'initiatives' => 'proposals' }.freeze

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all.where.not(code: NavBarItemPolicy.feature_disabled_codes)
    end
  end

  class << self
    def feature_disabled_codes
      config = AppConfiguration.instance
      FEATURES_CODES.reject { |feature, _code| config.feature_activated?(feature) }.values
    end
  end

  def removed_default_items?
    user&.active? && user&.admin?
  end

  def create?
    user&.active? && user&.admin?
  end

  def update?
    user&.active? && user&.admin?
  end

  def reorder?
    update?
  end

  def destroy?
    update?
  end

  def permitted_attributes_for_create
    [:code, :static_page_id, :project_id, { title_multiloc: CL2_SUPPORTED_LOCALES }]
  end

  def permitted_attributes_for_update
    [title_multiloc: CL2_SUPPORTED_LOCALES]
  end

  def permitted_attributes_for_reorder
    %i[ordering]
  end
end
