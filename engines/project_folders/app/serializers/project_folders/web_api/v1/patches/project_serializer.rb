# frozen_string_literal: true

module ProjectFolders
  module WebApi
    module V1
      module Patches
        module ProjectSerializer
          def self.prepended(base)
            base.class_eval do
              attribute :folder_id do |project|
                project.folder&.id
              end
            end
          end
        end
      end
    end
  end
end
