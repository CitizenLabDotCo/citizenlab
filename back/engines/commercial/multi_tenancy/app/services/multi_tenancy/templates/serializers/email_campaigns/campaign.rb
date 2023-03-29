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

          attribute(:text_images_attributes) do |campaign, serialization_params|
            serializer = MultiTenancy::Templates::Serializers::TextImage.new(serialization_params)
            campaign.text_images.map do |text_image|
              serializer.serialize(text_image)
            end
          end
        end
      end
    end
  end
end
