# frozen_string_literal: true

module PublicApi
  class ProjectFoldersFinder
    def initialize(scope, publication_status: nil)
      @scope = scope.includes([:admin_publication])
      @publication_status = publication_status
    end

    def execute
      return @scope unless @publication_status

      @scope
        .joins(:admin_publication)
        .where(admin_publications: { publication_status: @publication_status })
    end
  end
end
