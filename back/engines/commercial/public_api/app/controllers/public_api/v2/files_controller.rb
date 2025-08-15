# frozen_string_literal: true

module PublicApi
  class V2::FilesController < PublicApiController
    include DeletedItemsAction
    include CarrierwaveErrorDetailsTransformation

    def index
      files = ::Files::FileFinder.new(**finder_params).execute
      list_items files, V2::FileSerializer, root_key: :files
    end

    def show
      show_item ::Files::File.find(params[:id]), V2::FileSerializer, root_key: :file
    end

    def create
      file = ::Files::File.new(create_params)
      file.files_projects.build(project_id: params[:file][:project_id]) if params[:file][:project_id]

      side_fx.before_create(file, nil)
      if file.save
        side_fx.after_create(file, nil)
        show_item file, V2::FileSerializer, root_key: :file, status: :created
      else
        render json: { errors: transform_carrierwave_error_details(file.errors, :content) }, status: :unprocessable_entity
      end
    end

    def update
      file = ::Files::File.find(params[:id])

      side_fx.before_update(file, nil)
      if file.update(update_params)
        side_fx.after_update(file, nil)
        show_item file, V2::FileSerializer, root_key: :file
      else
        render json: { errors: file.errors.details }, status: :unprocessable_entity
      end
    end

    def destroy
      file = ::Files::File.find(params[:id])

      side_fx.before_destroy(file, nil)
      file.destroy!
      side_fx.after_destroy(file, nil)

      head :no_content
    end

    private

    def create_params
      params.require(:file).permit(
        :category,
        :ai_processing_allowed,
        description_multiloc: {}
      ).tap do |create_params|
        create_params[:content_by_content] = params.require(:file).permit(:content, :name)
      end
    end

    def update_params
      params.require(:file).permit(
        :name,
        :category,
        :ai_processing_allowed,
        description_multiloc: {}
      )
    end

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

    def side_fx
      @side_fx ||= ::Files::SideFxFileService.new
    end
  end
end
