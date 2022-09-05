# frozen_string_literal: true

module BulkImportIdeas
  class Engine < ::Rails::Engine
    isolate_namespace BulkImportIdeas

    config.to_prepare do
      require 'bulk_import_ideas/feature_specification'
      AppConfiguration::Settings.add_feature ::BulkImportIdeas::FeatureSpecification
    end
  end
end
