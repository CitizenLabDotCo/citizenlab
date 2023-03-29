# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ProjectFile < Base
        ref_attribute :project
        upload_attribute :file
        attributes %i[name ordering]
      end
    end
  end
end
