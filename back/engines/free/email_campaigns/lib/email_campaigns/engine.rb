# frozen_string_literal: true

module EmailCampaigns
  class Engine < ::Rails::Engine
    isolate_namespace EmailCampaigns

    initializer 'email_campaigns.metadata_interceptor' do
      ActiveSupport.on_load(:action_mailer) do
        register_interceptor 'EmailCampaigns::MetadataInterceptor'
      end
    end
  end
end
