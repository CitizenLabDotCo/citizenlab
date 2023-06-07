# frozen_string_literal: true

module IdeaAssignment
  module Extensions
    module WebApi
      module V1
        module ProjectSerializer
          def self.included(base)
            base.class_eval do
              belongs_to :default_assignee, record_type: :assignee, serializer: :user, if: proc { |object, params|
                can_moderate? object, params
              }
            end
          end
        end
      end
    end
  end
end
