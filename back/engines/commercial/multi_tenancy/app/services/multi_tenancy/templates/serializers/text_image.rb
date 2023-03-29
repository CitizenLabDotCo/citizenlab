# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class TextImage < Base
        attributes %i[imageable_field text_reference]
        upload_attribute :image
      end
    end
  end
end
