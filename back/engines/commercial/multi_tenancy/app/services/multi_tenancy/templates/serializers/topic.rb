# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Topic < Base
        attributes %i[code description_multiloc icon ordering title_multiloc]
      end
    end
  end
end
