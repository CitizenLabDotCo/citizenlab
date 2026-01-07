# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InputTopic < Base
        attributes %i[description_multiloc icon ordering title_multiloc]
        ref_attribute :project
      end
    end
  end
end
