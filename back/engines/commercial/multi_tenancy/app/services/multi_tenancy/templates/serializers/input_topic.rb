# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InputTopic < Base
        attributes %i[description_multiloc icon title_multiloc]
        ref_attribute :project
        ref_attribute :parent
      end
    end
  end
end
