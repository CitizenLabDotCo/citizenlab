# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class StaticPage < Base
        upload_attribute :header_bg

        attributes %i[
          banner_cta_button_multiloc
          banner_cta_button_type
          banner_cta_button_url
          banner_enabled
          banner_header_multiloc
          banner_layout
          banner_overlay_color
          banner_overlay_opacity
          banner_subheader_multiloc
          bottom_info_section_enabled
          bottom_info_section_multiloc
          code
          events_widget_enabled
          files_section_enabled
          projects_enabled
          projects_filter_type
          slug
          title_multiloc
          top_info_section_enabled
          top_info_section_multiloc
        ]

        attribute(:text_images_attributes) do |static_page, serialization_params|
          serializer = MultiTenancy::Templates::Serializers::TextImage.new(serialization_params)
          static_page.text_images.map { |text_image| serializer.serialize(text_image) }
        end
      end
    end
  end
end
