# frozen_string_literal: true

module BulkImportIdeas
  module WebApi
    module V1
      class ProjectImportSerializer < ::WebApi::V1::BaseSerializer
        attributes :locale, :created_at, :updated_at, :log, :import_id, :project_id, :import_type

        attribute :project_title_multiloc do |object|
          object.project&.title_multiloc
        end
      end
    end
  end
end
