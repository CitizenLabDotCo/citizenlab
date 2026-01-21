# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class DefaultInputTopic < Base
        attributes %i[description_multiloc icon ordering title_multiloc]
      end
    end
  end
end
