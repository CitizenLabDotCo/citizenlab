# frozen_string_literal: true

module Webhooks
  module WebApi
    module V1
      class WebhookDeliveriesController < ::ApplicationController
        before_action :set_subscription
        before_action :set_delivery, only: [:show]
        skip_after_action :verify_policy_scoped, only: [:index]

        def index
          @deliveries = @subscription.deliveries
            .includes(:activity)
            .order(created_at: :desc)

          @deliveries = paginate @deliveries

          render json: WebApi::V1::WebhookDeliverySerializer.new(
            @deliveries,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def show
          render json: WebApi::V1::WebhookDeliverySerializer.new(
            @delivery,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        private

        def set_subscription
          @subscription = Webhooks::Subscription.find(params[:webhook_subscription_id])
          authorize @subscription, :show?
        end

        def set_delivery
          @delivery = @subscription.deliveries.find(params[:id])
        end
      end
    end
  end
end
