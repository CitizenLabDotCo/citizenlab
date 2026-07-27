# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module EmailCampaigns
        class Campaign < Base
          ref_attributes %i[author context]

          attributes %i[
            body_multiloc
            button_text_multiloc
            enabled
            intro_multiloc
            reply_to
            schedule
            sender
            subject_multiloc
            title_multiloc
            type
          ]
        end
      end
    end
  end
end
