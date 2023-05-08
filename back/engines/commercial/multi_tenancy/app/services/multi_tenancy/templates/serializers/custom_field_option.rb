# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomFieldOption < Base
        ref_attribute :custom_field
        attributes %i[key ordering title_multiloc]
      end
    end
  end
end
