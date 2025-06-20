# frozen_string_literal: true

module Files
  class FilePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        return scope.none unless active?

        admin? ? scope.all : scope.none
      end
    end
  end
end
