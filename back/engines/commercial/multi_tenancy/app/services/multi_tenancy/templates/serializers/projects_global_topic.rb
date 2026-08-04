# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ProjectsGlobalTopic < Base
        ref_attributes %i[project global_topic]
      end
    end
  end
end
