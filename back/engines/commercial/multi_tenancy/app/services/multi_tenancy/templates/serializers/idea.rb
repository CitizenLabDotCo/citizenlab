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

        attribute(:custom_field_values) do |idea, _serialization_params|
          custom_forms = ::CustomForm.where(participation_context_id: [idea.project_id, idea.creation_phase_id].compact)
          custom_fields = ::CustomField.where(resource: custom_forms)

          next {} if custom_fields.blank?

          filter_custom_field_values(idea.custom_field_values, custom_fields)
        end

        def self.filter_custom_field_values(custom_field_values, custom_fields)
          supported_fields = custom_fields.reject(&:supports_file_upload?)
          custom_field_values.slice(*supported_fields.map(&:key))
        end
      end
    end
  end
end
