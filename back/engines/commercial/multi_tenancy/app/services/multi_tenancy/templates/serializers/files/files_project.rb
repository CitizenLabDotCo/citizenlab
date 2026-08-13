# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Files
        class FilesProject < Base
          ref_attributes %i[file project]
        end
      end
    end
  end
end
