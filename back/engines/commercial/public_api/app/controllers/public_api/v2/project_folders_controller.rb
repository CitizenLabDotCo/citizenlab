# frozen_string_literal: true

module PublicApi
  class V2::ProjectFoldersController < PublicApiController
    include DeletedItemsAction

    def index
      folders = ProjectFoldersFinder.new(
        ProjectFolders::Folder,
        publication_status: publication_status
      ).execute

      list_items(
        ProjectFoldersFinder.new(folders, publication_status: publication_status).execute,
        V2::ProjectFolders::FolderSerializer
      )
    end

    def show
      show_item(
        ProjectFolders::Folder.includes(:admin_publication).find(params[:id]),
        V2::ProjectFolders::FolderSerializer
      )
    end

    private

    def publication_status
      @publication_status ||= params[:publication_status]&.tap do |status|
        validate_publication_status!(status)
      end
    end

    def validate_publication_status!(status)
      return if status.in?(AdminPublication::PUBLICATION_STATUSES)

      raise InvalidEnumParameterValueError.new(
        :publication_status, status, AdminPublication::PUBLICATION_STATUSES
      )
    end
  end
end
