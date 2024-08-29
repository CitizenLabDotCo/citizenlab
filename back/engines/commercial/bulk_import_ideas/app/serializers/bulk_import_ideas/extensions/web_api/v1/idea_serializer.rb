# frozen_string_literal: true

module BulkImportIdeas
  module Extensions
    module WebApi
      module V1
        module IdeaSerializer
          def self.included(base)
            base.class_eval do
              has_one :idea_import, serializer: BulkImportIdeas::WebApi::V1::IdeaImportSerializer, if: proc { |object, params|
                can_moderate?(object, params)
              }
            end
          end
        end
      end
    end
  end
end
