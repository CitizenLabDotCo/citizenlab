# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Idea < Base
        ref_attributes %i[author creation_phase idea_status project]

        attributes %i[
          body_multiloc
          budget
          location_description
          location_point_geojson
          proposed_budget
          publication_status
          title_multiloc
          author_hash
          anonymous
          baskets_count
          votes_count
        ]

        attribute(:submitted_at) { |idea| serialize_timestamp(idea.submitted_at) }
        attribute(:published_at) { |idea| serialize_timestamp(idea.published_at) }

      end
    end
  end
end
