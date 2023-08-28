module BulkImportIdeas
  class WebApi::V1::IdeaImportsController < ApplicationController
    before_action :authorize_idea_imports
 
    def show
      idea_import = IdeaImport.where(id: params[:id]).first

      render json: WebApi::V1::IdeaImportSerializer.new(
        idea_import,
        params: jsonapi_serializer_params
      ).serializable_hash
    end

    private

    def authorize_idea_imports
      authorize :'bulk_import_ideas/idea_imports'
    end
  end
end