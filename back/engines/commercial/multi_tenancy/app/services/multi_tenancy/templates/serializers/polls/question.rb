# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Polls
        class Question < Base
          ref_attribute :participation_context
          attributes %i[max_options ordering question_type title_multiloc]
        end
      end
    end
  end
end
