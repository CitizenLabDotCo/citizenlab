# frozen_string_literal: true

module UserCustomFields
  module Representativeness
    class RScorePolicy < ApplicationPolicy
      def show?
        active? && admin?
      end
    end
  end
end
