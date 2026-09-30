# frozen_string_literal: true

module ContentBuilder
  class CustomBlockPolicy < ApplicationPolicy
    FEATURE_NAME = 'llm_reporting'

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

    # Reading one version of a block: its metadata, and (via +bundle?+) its compiled
    # code. Published blocks are readable by anyone who can reach the report that
    # places them; a draft or disabled block is admin-only.
    #
    # Blocks are written by the report generation loop, not through the API, so there
    # is no create/update/destroy to authorize here.
    def show?
      return false if !feature_activated?

      active_admin? || record.published?
    end

    def bundle?
      show?
    end

    private

    def feature_activated?
      self.class.feature_activated?
    end
  end
end
