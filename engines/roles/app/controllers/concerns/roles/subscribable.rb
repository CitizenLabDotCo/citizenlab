module Roles
  module Subscribable
    extend ActiveSupport::Concern

    def subscriber
      role_mapping.subscriber
    end

    def subscriber_payload
      [@roled_resource, roleable, current_user]
    end

    def publish_before_create
      subscriber&.before_create(*subscriber_payload)
    end

    def publish_after_create
      subscriber&.after_create(*subscriber_payload)
    end

    def publish_before_destroy
      subscriber&.before_destroy(*subscriber_payload)
    end

    def publish_after_destroy
      subscriber&.after_destroy(*subscriber_payload)
    end
  end
end
