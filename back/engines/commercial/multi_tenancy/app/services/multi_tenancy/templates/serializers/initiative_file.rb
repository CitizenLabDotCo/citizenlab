# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InitiativeFile < Base
        ref_attribute :initiative
        upload_attribute :file
        attributes %i[name ordering]
      end
    end
  end
end
