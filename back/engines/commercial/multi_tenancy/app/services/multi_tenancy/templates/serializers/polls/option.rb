# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Polls
        class Option < Base
          ref_attribute :question
          attributes %i[ordering title_multiloc]
        end
      end
    end
  end
end
