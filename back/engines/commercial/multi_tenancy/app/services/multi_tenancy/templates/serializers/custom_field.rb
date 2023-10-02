# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomField < Base
        ref_attribute :resource

        attributes %i[
          answer_visible_to
          code
          description_multiloc
          enabled
          input_type
          key
          maximum
          maximum_label_multiloc
          minimum_label_multiloc
          select_count_enabled
          maximum_select_count
          minimum_select_count
          ordering
          title_multiloc
        ]

        # Enigmatic comment from the previous implementation:
        # > No user custom fields are required anymore because the user choices cannot
        # > be remembered.
        attribute(
          :resource_type,
          if: proc { |record| record.resource_type == ::User.name }
        )

        attribute(
          :required,
          if: proc { |record| record.resource_type != ::User.name }
        )
      end
    end
  end
end
