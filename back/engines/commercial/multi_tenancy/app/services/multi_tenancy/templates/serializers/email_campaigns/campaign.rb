# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module EmailCampaigns
        class Campaign < Base
          ref_attribute :author

          attributes %i[
            type
            enabled
            sender
            subject_multiloc
            body_multiloc
          ]
        end
      end
    end
  end
end
