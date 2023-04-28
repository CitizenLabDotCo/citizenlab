# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ProjectImage < Base
        ref_attribute :project
        upload_attribute :image
        attribute :ordering
      end
    end
  end
end
