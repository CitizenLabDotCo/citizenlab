# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module EmailCampaigns
        class Campaign < Base
          ref_attributes %i[author context]

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
