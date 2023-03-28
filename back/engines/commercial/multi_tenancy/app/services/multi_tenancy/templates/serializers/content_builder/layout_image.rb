# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ContentBuilder
        class LayoutImage < Base
          attribute :code
          upload_attribute :image
        end
      end
    end
  end
end
