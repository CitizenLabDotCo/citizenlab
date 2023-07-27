# frozen_string_literal: true

module PublicApi
  class WebApi::V1::ApiClientsController < ApplicationController
    before_action :set_api_client, only: %i[show destroy]

    def index
      authorize ApiClient
      @api_clients = policy_scope(ApiClient).order(created_at: :asc)
      @api_clients = paginate(@api_clients)

      render json: linked_json(@api_clients, WebApi::V1::ApiClientSerializer, params: jsonapi_serializer_params)
    end

    def show
      render json: WebApi::V1::ApiClientSerializer.new(@api_client, params: jsonapi_serializer_params).serializable_hash
    end

    def create
      @api_client = ApiClient.new(api_client_params)
      secret = @api_client.generate_secret
      authorize @api_client

      if @api_client.save
        side_fx_service.after_create(@api_client, current_user)
        render json: WebApi::V1::ApiClientUnmaskedSerializer.new(
          @api_client,
          params: { **jsonapi_serializer_params, secret: secret }
        ).serializable_hash, status: :created
      else
        render json: { errors: @api_client.errors.details }, status: :unprocessable_entity
      end
    end

    def destroy
      if @api_client.destroy
        side_fx_service.after_destroy(@api_client, current_user)
        head :ok
      else
        render json: { errors: @api_client.errors.details }, status: :unprocessable_entity
      end
    end

    private

    def set_api_client
      @api_client = ApiClient.find(params[:id])
      authorize @api_client
    end

    def api_client_params
      params.require(:api_client).permit(:name)
    end

    def side_fx_service
      @side_fx_service ||= SideFxApiClientService.new
    end
  end
end
