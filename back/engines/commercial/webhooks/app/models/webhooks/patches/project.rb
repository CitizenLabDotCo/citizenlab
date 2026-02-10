# frozen_string_literal: true

module Webhooks::Patches::Project
  def self.included(base)
    base.class_eval do
      has_many :webhook_subscriptions, class_name: 'Webhooks::Subscription', dependent: :destroy
    end
  end
end
