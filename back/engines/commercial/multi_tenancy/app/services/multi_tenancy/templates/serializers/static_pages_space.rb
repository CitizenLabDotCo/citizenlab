# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class StaticPagesSpace < Base
        ref_attributes %i[static_page space]
      end
    end
  end
end
