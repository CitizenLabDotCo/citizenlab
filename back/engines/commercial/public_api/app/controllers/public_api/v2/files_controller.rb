# frozen_string_literal: true

module PublicApi
  class V2::FilesController < PublicApiController
    include DeletedItemsAction

    def index
      files = ::Files::FileFinder.new(**finder_params).execute
      list_items files, V2::FileSerializer, root_key: :files
    end

    def show
      show_item ::Files::File.find(params[:id]), V2::FileSerializer, root_key: :file
    end

    private

    def finder_params
      permitted = params.permit(
        :search, :uploader, :project_id, :category,
        uploader: [], project_id: [], category: []
      ).to_h.symbolize_keys

      # Map project_id to project for FileFinder
      if permitted.key?(:project_id)
        permitted[:project] = permitted.delete(:project_id)
      end

      permitted
    end
  end
end