# frozen_string_literal: true

module ContentBuilder
  class CustomBlockAISessionPolicy < ApplicationPolicy
    def create?
      feature_activated? && active_admin?
    end

    def show?
      create?
    end

    private

    def feature_activated?
      CustomBlockPolicy.feature_activated?
    end
  end
end
