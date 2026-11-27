# frozen_string_literal: true

require 'email_campaigns/metadata_interceptor'
require 'email_campaigns/scaleway_tem_delivery_method'

module EmailCampaigns
  class Engine < ::Rails::Engine
    isolate_namespace EmailCampaigns

    # Before `action_mailer.set_configs`, which calls the `scaleway_tem_settings=` setter
    # that `add_delivery_method` defines.
    initializer 'email_campaigns.delivery_methods', before: 'action_mailer.set_configs' do
      ActiveSupport.on_load(:action_mailer) do
        add_delivery_method :scaleway_tem, EmailCampaigns::ScalewayTemDeliveryMethod
      end
    end

    initializer 'email_campaigns.metadata_interceptor' do
      ActiveSupport.on_load(:action_mailer) do
        register_interceptor EmailCampaigns::MetadataInterceptor
      end
    end
  end
end
