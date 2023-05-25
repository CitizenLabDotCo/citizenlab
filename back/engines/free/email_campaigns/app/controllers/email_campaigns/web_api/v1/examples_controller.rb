# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::ExamplesController < EmailCampaignsController
    before_action :set_example, only: :show

    def index
      authorize Example

      @examples = policy_scope(Example)
        .where(campaign_id: params[:campaign_id])

      @examples = paginate(@examples)

      render json: linked_json(@examples, WebApi::V1::ExampleSerializer, params: jsonapi_serializer_params)
    end

    def show
      render json: WebApi::V1::ExampleSerializer.new(@example, params: jsonapi_serializer_params).serializable_hash
    end

    private

    def set_example
      @example = Example.find(params[:id])
      authorize @example
    end
  end
end
