# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ProjectsAllowedInputTopic < Base
        ref_attributes %i[project topic]
        attribute :ordering
      end
    end
  end
end
