# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomFieldAnswer < Base
        ref_attributes %i[answerable custom_field]

        attributes %i[key value]
      end
    end
  end
end
