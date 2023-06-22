# frozen_string_literal: true

module PublicApi
  class ProjectsFinder

    def initialize(scope, folder_id: nil, publication_status: nil)
      @scope = scope
      @folder_id = folder_id
      @publication_status = publication_status
    end

    def execute
      @scope
        .then { |scope| filter_by_folder_id(scope) }
        .then { |scope| filter_by_publication_status(scope) }
    end

    private

    def filter_by_folder_id(scope)
      return scope unless @folder_id

      folder = ProjectFolders::Folder.find(@folder_id)
      folder_admin_publication = folder.admin_publication

      scope
        .joins(:admin_publication)
        .where(admin_publication: { parent_id: folder_admin_publication.id})
    end

    def filter_by_publication_status(scope)
      return scope unless status = @publication_status

      scope
        .joins(:admin_publication)
        .where(admin_publication: { publication_status: @publication_status })
    end
  end
end
