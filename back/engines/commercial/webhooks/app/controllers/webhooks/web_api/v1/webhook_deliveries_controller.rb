# frozen_string_literal: true

module Webhooks
  module WebApi
    module V1
      class WebhookDeliveriesController < ::ApplicationController
        before_action :set_delivery, only: %i[show replay]
        before_action :set_subscription, only: [:index]
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

        def replay
          new_delivery = Delivery.create!(
            subscription: @delivery.subscription,
            activity: @delivery.activity,
            event_type: @delivery.event_type,
            status: 'pending'
          )
          Webhooks::DeliveryJob.perform_later(new_delivery)
          render json: WebApi::V1::WebhookDeliverySerializer.new(
            new_delivery,
            params: jsonapi_serializer_params
          ).serializable_hash, status: :created
        end

        private

        def set_subscription
          @subscription = Webhooks::Subscription.find(params[:webhook_subscription_id])
          authorize @subscription, :show?
        end

        def set_delivery
          @delivery = Delivery.find(params[:id])
          authorize @delivery
        end
      end
    end
  end
end
