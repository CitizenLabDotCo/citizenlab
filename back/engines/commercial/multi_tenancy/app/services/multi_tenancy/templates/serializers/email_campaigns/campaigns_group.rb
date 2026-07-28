# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module EmailCampaigns
        class CampaignsGroup < Base
          ref_attributes %i[campaign group]
        end
      end
    end
  end
end
