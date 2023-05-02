# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ProjectFolders
        class File < Base
          ref_attribute :project_folder
          upload_attribute :file
          attributes %i[name ordering]
        end
      end
    end
  end
end
