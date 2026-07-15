# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class StaticPage < Base
        # Only set on project-scoped pages; global pages have no project.
        ref_attribute :project

        upload_attribute :header_bg

        # Project-scoped (project-level) static pages belong to a project; nil for global pages,
        # in which case the ref is skipped.
        ref_attribute :project

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
      end
    end
  end
end
