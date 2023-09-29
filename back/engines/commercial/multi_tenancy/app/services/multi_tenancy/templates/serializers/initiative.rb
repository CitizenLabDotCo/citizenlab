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
          author_hash
          anonymous
          editing_locked
        ]

        attribute(:published_at) { |initiative| serialize_timestamp(initiative.published_at) }
      end
    end
  end
end
