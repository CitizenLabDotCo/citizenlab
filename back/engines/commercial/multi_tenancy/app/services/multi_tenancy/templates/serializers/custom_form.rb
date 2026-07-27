# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomForm < Base
        ref_attribute :participation_context

        attributes %i[
          print_start_multiloc
          print_end_multiloc
          print_personal_data_fields
        ]
      end
    end
  end
end
