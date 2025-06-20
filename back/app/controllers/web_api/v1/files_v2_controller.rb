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
end
