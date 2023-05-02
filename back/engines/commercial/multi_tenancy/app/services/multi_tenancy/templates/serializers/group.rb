# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Group < Base
        attributes %i[membership_type rules title_multiloc]
      end
    end
  end
end
