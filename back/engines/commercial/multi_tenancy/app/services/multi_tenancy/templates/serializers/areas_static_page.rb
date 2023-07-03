# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class AreasStaticPage
        include Core

        ref_attributes %i[area static_page]
      end
    end
  end
end
