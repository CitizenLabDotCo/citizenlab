# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomFieldOptionImage < Base
        ref_attribute :custom_field_option
        upload_attribute :image
        attribute :ordering
      end
    end
  end
end
