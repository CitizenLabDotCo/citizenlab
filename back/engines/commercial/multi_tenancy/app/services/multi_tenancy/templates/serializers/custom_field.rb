# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomField < Base
        ref_attribute :resource

        attributes %i[
          code
          description_multiloc
          enabled
          input_type
          key
          maximum
          linear_scale_label_1_multiloc
          linear_scale_label_2_multiloc
          linear_scale_label_3_multiloc
          linear_scale_label_4_multiloc
          linear_scale_label_5_multiloc
          linear_scale_label_6_multiloc
          linear_scale_label_7_multiloc
          linear_scale_label_8_multiloc
          linear_scale_label_9_multiloc
          linear_scale_label_10_multiloc
          linear_scale_label_11_multiloc
          select_count_enabled
          maximum_select_count
          minimum_select_count
          ordering
          title_multiloc
          random_option_ordering
          dropdown_layout
          page_layout
          page_button_label_multiloc
          page_button_link
          ask_follow_up
          question_category
          include_in_printed_form
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
