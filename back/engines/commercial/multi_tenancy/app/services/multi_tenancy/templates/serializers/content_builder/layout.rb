# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ContentBuilder
        class Layout < Base
          ref_attribute :content_buildable

          attributes %i[code content_buildable_type craftjs_jsonmultiloc enabled]
        end
      end
    end
  end
end
