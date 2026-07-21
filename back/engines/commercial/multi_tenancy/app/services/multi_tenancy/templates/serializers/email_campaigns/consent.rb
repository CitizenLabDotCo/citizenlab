# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module EmailCampaigns
        class Consent < Base
          ref_attribute :user
          attributes %i[campaign_type consented]
        end
      end
    end
  end
end
