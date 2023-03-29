# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Project < ParticipationContext
        upload_attribute :header_bg

        attributes %i[
          description_multiloc
          description_preview_multiloc
          include_all_areas
          internal_role
          process_type
          title_multiloc
          visible_to
        ]

        attribute(:text_images_attributes) do |project, serialization_params|
          serializer = MultiTenancy::Templates::Serializers::TextImage.new(serialization_params)
          project.text_images.map { |text_image| serializer.serialize(text_image) }
        end

        attribute(
          :admin_publication_attributes,
          if: proc { |project| project.admin_publication.present? }
        ) do |project, serialization_params|
          serializer = MultiTenancy::Templates::Serializers::AdminPublication.new(serialization_params)
          serializer.serialize(project.admin_publication)
        end
      end
    end
  end
end
