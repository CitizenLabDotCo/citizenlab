# frozen_string_literal: true

module BulkImportIdeas
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'bulk_import_ideas'
    end

    def self.feature_title
      'Bulk import ideas'
    end

    def self.feature_description
      'Create many ideas at once by importing an XLSX sheet.'
    end
  end
end
