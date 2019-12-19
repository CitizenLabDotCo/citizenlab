module EmailCampaigns
  module AdminApi
    module Types
      module UserType
        extend ActiveSupport::Concern

        included do
          field :unsubscription_token, String, null: true
        end

        def unsubscription_token
          object.email_campaigns_unsubscription_token&.token
        end

      end
    end
  end
end