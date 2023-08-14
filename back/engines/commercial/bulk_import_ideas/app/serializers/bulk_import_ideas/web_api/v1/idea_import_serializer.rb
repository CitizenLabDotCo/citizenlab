# frozen_string_literal: true

module BulkImportIdeas
  module WebApi
    module V1
      class IdeaImportSerializer < ::WebApi::V1::BaseSerializer
        attributes :user_created, :file_path, :file_type, :created_at, :updated_at
      end
    end
  end
end
