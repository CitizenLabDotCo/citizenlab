# frozen_string_literal: true

module ContentBuilder
  class CustomBlockPolicy < ApplicationPolicy
    FEATURE_NAME = 'custom_page_blocks'

    def self.feature_activated?
      AppConfiguration.instance.feature_activated?(FEATURE_NAME)
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        return scope.none if !CustomBlockPolicy.feature_activated?
        return scope.all if active_admin?

        scope.where(status: 'published')
      end
    end

    def index?
      feature_activated? && active_admin?
    end

    def create?
      feature_activated? && active_admin?
    end

    def update?
      create?
    end

    def destroy?
      create?
    end

    def show?
      return false if !feature_activated?

      active_admin? || record.published?
    end

    # Serving the compiled bundle of one version. Same audience as +show?+: the bundle is
    # public for published blocks, admin-only while a block is still being authored.
    def bundle?
      show?
    end

    def versions_index?
      create?
    end

    def versions_create?
      create?
    end

    private

    def feature_activated?
      self.class.feature_activated?
    end
  end
end
