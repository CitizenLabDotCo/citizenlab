# frozen_string_literal: true

module BulkImportIdeas
  module WebApi
    module V1
      class IdeaImportSerializer < ::WebApi::V1::BaseSerializer
        attributes :user_created, :user_consent, :page_range, :locale, :created_at, :updated_at

        attribute :file do |object|
          object.file ? { url: "/web_api/v1/idea_import_files/#{object.file&.id}" } : nil
        end

        attribute :import_type do |object|
          object.file&.import_type
        end

        attribute :parsed_value do |object|
          object.file&.parsed_value
        end
      end
    end
  end
end
