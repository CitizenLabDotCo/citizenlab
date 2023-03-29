# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class IdeaImage < Base
        ref_attribute :idea
        upload_attribute :image
        attribute :ordering
      end
    end
  end
end
