# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class NavBarItem < Base
        ref_attribute :static_page
        attributes %i[code ordering title_multiloc]
      end
    end
  end
end
