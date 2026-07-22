# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Project < Base
        upload_attribute :header_bg

        attributes %i[
          description_multiloc
          description_preview_multiloc
          header_bg_alt_text_multiloc
          hidden
          include_all_areas
          internal_role
          listed
          live_auto_input_topics_enabled
          title_multiloc
          track_participation_location
          visible_to
        ]

        ref_attribute :space
      end
    end
  end
end
