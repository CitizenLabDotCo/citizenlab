# frozen_string_literal: true

class WebApi::V1::FilesV2Controller < ApplicationController
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
end
