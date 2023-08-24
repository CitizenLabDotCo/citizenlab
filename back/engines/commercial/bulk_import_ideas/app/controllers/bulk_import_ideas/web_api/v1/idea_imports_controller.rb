module BulkImportIdeas
  class WebApi::V1::IdeaImportsController < ApplicationController  
    def show
      idea_import = IdeaImport.where(id: params[:id]).first
      authorize idea_import

      render json: WebApi::V1::IdeaImportSerializer.new(
        idea_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end
  end
end