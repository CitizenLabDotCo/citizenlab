# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module EmailCampaigns
        class UnsubscriptionToken
          include Core

          ref_attribute :user
          attribute :token
        end
      end
    end
  end
end
