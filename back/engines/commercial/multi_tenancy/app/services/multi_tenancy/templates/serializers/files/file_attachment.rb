# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Files
        class FileAttachment < Base
          ref_attributes %i[file attachable]
          attribute :position
        end
      end
    end
  end
end
