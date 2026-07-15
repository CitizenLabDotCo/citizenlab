# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ProjectImage < Base
        ref_attribute :project
        upload_attribute :image
        attributes %i[ordering alt_text_multiloc]
      end
    end
  end
end
