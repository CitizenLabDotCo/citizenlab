# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Project < Base
        upload_attribute :header_bg

        attributes %i[
          description_multiloc
          description_preview_multiloc
          include_all_areas
          internal_role
          title_multiloc
          visible_to
          hidden
        ]
      end
    end
  end
end
