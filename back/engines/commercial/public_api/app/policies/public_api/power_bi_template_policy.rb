# frozen_string_literal: true

module PublicApi
  class PowerBiTemplatePolicy < ApplicationPolicy
    def show?
      active? && admin?
    end
  end
end
