# frozen_string_literal: true

require 'active_support/concern'

module Analysis
  module FilterParamsExtraction
    extend ActiveSupport::Concern

    included do
      def filters(filter_params = params)
        correct_array_null_values(input_filter_params(filter_params).to_h)
      end

      # Rails interprets the url query param `?tag_ids[]=` as `tag_ids: [""]`
      # Both the FE and the back-end use an internal representation
      # of this filter of `tag_ids: [nil]` (or null in JS), meaning all inputs wihtout tags.
      # This function converts the empty string to `nil` within the given hash of params
      def correct_array_null_values(params_hash)
        params_hash.transform_values do |value|
          if value.is_a?(Array)
            value.map { |item| item == '' ? nil : item }
          else
            value
          end
        end
      end

      def input_filter_params(filter_params = params)
        permitted_dynamic_keys = []
        permitted_dynamic_array_keys = { tag_ids: [] }

        filter_params.each_key do |key|
          if key.match?(/^(author|input)_custom_([a-f0-9-]+)_(from|to)$/)
            permitted_dynamic_keys << key
          elsif key.match?(/^(author|input)_custom_([a-f0-9-]+)$/)
            permitted_dynamic_array_keys[key] = []
          end
        end

        filter_params.permit(
          :search,
          :published_at_from,
          :published_at_to,
          :reactions_from,
          :reactions_to,
          :votes_from,
          :votes_to,
          :comments_from,
          :comments_to,
          *permitted_dynamic_keys,
          **permitted_dynamic_array_keys
        )
      end
    end
  end
end
