# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class IdeaFile < Base
        ref_attribute :idea
        upload_attribute :file
        attributes %i[name ordering]
      end
    end
  end
end
