# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module WebApi
      module V1
        module AdminPublicationSerializer
          def self.included(base)
            base.class_eval do
              attribute :publication_visible_to, if: Proc.new { |object|
                object.publication.respond_to?(:visible_to)
              } do |object|
                object.publication.visible_to
              end
            end
          end
        end
      end
    end
  end
end
