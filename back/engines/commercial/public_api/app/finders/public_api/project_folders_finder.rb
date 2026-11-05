# frozen_string_literal: true

module PublicApi
  class ProjectFoldersFinder
    def initialize(scope, publication_status: nil)
      @scope = scope
      @publication_status = publication_status
    end

    def execute
      return @scope unless @publication_status

      @scope.where(admin_publication: AdminPublication.with_status(@publication_status))
    end
  end
end
