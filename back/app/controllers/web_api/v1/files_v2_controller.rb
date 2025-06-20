# frozen_string_literal: true

class WebApi::V1::FilesV2Controller < ApplicationController
  include CarrierwaveErrorDetailsTransformation

  def index
    files = policy_scope(Files::File)
      .then { paginate(_1) }

    render json: linked_json(
      files,
      WebApi::V1::FileV2Serializer,
      params: jsonapi_serializer_params
    )
  end

  def show
    file = authorize(Files::File.find(params[:id]))

    render json: WebApi::V1::FileV2Serializer.new(
      file,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create
    file = authorize(Files::File.new(create_params))

    if file.save
      render json: WebApi::V1::FileV2Serializer.new(
        file,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: transform_carrierwave_error_details(file.errors, :content) }, status: :unprocessable_entity
    end
  end

  def destroy
    file = authorize(Files::File.find(params[:id]))
    file.destroy!
    head :no_content
  end

  private

  def create_params
    {
      content_by_content: params.require(:file).permit(:content, :name),
      uploader_id: current_user.id
    }
  end
end
