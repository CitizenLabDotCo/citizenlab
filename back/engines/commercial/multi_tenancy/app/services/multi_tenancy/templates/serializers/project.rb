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
      end
    end
  end
end
