# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class DefaultInputTopic < Base
        attributes %i[description_multiloc icon title_multiloc]
      end
    end
  end
end
