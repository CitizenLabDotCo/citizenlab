# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Initiative < Base
        ref_attribute :author

        attributes %i[
          body_multiloc
          location_description
          location_point_geojson
          publication_status
          title_multiloc
        ]

        attribute(:published_at) { |initiative| serialize_timestamp(initiative.published_at) }

        attribute(:text_images_attributes) do |initiative, serialization_params|
          serializer = MultiTenancy::Templates::Serializers::TextImage.new(serialization_params)
          initiative.text_images.map { |text_image| serializer.serialize(text_image) }
        end
      end
    end
  end
end
