# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomField < Base
        ref_attribute :resource

        attributes %i[
          answer_visible_to
          code
          description_multiloc
          enabled
          input_type
          key
          maximum
          maximum_label_multiloc
          minimum_label_multiloc
          ordering
          title_multiloc
        ]

        # Enigmatic comment from the previous implementation:
        # > No user custom fields are required anymore because the user choices cannot
        # > be remembered.
        attribute(
          :resource_type,
          if: proc { |record| record.resource_type == User.name }
        )

        attribute(
          :required,
          if: proc { |record| record.resource_type != User.name }
        )

        attribute(:text_images_attributes) do |record, serialization_params|
          serializer = MultiTenancy::Templates::Serializers::TextImage.new(serialization_params)
          record.text_images.map { |text_image| serializer.serialize(text_image) }
        end
      end
    end
  end
end
