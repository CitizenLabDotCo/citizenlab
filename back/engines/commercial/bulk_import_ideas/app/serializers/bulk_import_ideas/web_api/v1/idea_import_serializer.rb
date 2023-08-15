# frozen_string_literal: true

module BulkImportIdeas
  module WebApi
    module V1
      class IdeaImportSerializer < ::WebApi::V1::BaseSerializer
        # TODO: Add file attributes to this serializer
        attributes :user_created, :created_at, :updated_at

        attribute :file do |object|
          object.file.file
        end
      end
    end
  end
end
