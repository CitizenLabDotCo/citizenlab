# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Phase < ParticipationContext
        ref_attribute :project

        attributes %i[title_multiloc description_multiloc]
        attribute(:start_at) { |phase| serialize_timestamp(phase.start_at) }
        attribute(:end_at) { |phase| serialize_timestamp(phase.end_at) }

        attribute(:text_images_attributes) do |phase, serialization_params|
          serializer = MultiTenancy::Templates::Serializers::TextImage.new(serialization_params)
          phase.text_images.map { |text_image| serializer.serialize(text_image) }
        end
      end
    end
  end
end
