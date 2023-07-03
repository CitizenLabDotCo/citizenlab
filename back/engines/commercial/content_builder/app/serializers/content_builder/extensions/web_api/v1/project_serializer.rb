# frozen_string_literal: true

module ContentBuilder
  module Extensions
    module WebApi
      module V1
        module ProjectSerializer
          def self.included(base)
            base.class_eval do
              attribute :uses_content_builder do |project|
                project.uses_content_builder?
              end
            end
          end
        end
      end
    end
  end
end
