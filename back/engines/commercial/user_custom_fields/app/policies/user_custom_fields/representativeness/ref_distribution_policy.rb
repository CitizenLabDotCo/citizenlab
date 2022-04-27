# frozen_string_literal: true

module UserCustomFields
  module Representativeness
    class RefDistributionPolicy < ApplicationPolicy
      def show?
        active? && admin?
      end

      def create?
        active? && admin?
      end

      def destroy?
        active? && admin?
      end
    end
  end
end
