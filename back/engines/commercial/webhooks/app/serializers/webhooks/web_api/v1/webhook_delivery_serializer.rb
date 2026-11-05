# frozen_string_literal: true

module Webhooks
  module WebApi
    module V1
      class WebhookDeliverySerializer < ::WebApi::V1::BaseSerializer
        attributes :event_type, :status, :attempts, :response_code, :response_body,
          :error_message, :last_attempt_at, :succeeded_at, :created_at, :updated_at

        belongs_to :subscription, serializer: WebhookSubscriptionSerializer,
          id_method_name: :webhooks_subscription_id
        belongs_to :activity, serializer: ::WebApi::V1::ActivitySerializer
      end
    end
  end
end
