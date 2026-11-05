# frozen_string_literal: true

module Webhooks
  module WebApi
    module V1
      class WebhookSubscriptionsController < ::ApplicationController
        before_action :set_subscription, only: %i[show update destroy test regenerate_secret]

        def index
          authorize Webhooks::Subscription

          @subscriptions = policy_scope(Webhooks::Subscription)
            .includes(:project, :deliveries)
            .order(created_at: :desc)

          @subscriptions = paginate @subscriptions

          render json: WebApi::V1::WebhookSubscriptionSerializer.new(
            @subscriptions,
            params: jsonapi_serializer_params,
            include: [:project]
          ).serializable_hash
        end

        def show
          authorize @subscription
          render json: WebApi::V1::WebhookSubscriptionSerializer.new(
            @subscription,
            params: jsonapi_serializer_params,
            include: [:project]
          ).serializable_hash
        end

        def create
          @subscription = Webhooks::Subscription.new(subscription_params)
          authorize @subscription

          if @subscription.save
            render json: WebApi::V1::WebhookSubscriptionSerializer.new(
              @subscription,
              params: jsonapi_serializer_params(include_secret_token: true)
            ).serializable_hash, status: :created
          else
            render json: { errors: @subscription.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          authorize @subscription

          if @subscription.update(subscription_params)
            render json: WebApi::V1::WebhookSubscriptionSerializer.new(
              @subscription,
              params: jsonapi_serializer_params
            ).serializable_hash
          else
            render json: { errors: @subscription.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @subscription
          @subscription.destroy!
          head :no_content
        end

        def regenerate_secret
          authorize @subscription

          @subscription.update!(secret_token: SecureRandom.base64(32))
          render json: WebApi::V1::WebhookSubscriptionSerializer.new(
            @subscription,
            params: jsonapi_serializer_params(include_secret_token: true)
          ).serializable_hash
        end

        private

        def set_subscription
          @subscription = Webhooks::Subscription.find(params[:id])
        end

        def subscription_params
          params.require(:webhook_subscription).permit(
            :name, :url, :enabled, :project_id,
            events: []
          )
        end

        def create_test_activity
          # Create a minimal test activity (not saved to DB)
          Activity.new(
            item_type: 'Test',
            action: 'webhook',
            acted_at: Time.current,
            payload: { test: true, message: 'This is a test webhook' }
          )
        end
      end
    end
  end
end
