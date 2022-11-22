# frozen_string_literal: true

class NavBarItemPolicy < ApplicationPolicy
  FEATURES_CODES = { 'initiatives' => 'proposals' }.freeze

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

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
end

NavBarItemPolicy.include CustomizableNavbar::Extensions::NavBarItemPolicy
