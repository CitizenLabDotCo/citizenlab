# frozen_string_literal: true

module DecidimImporter
  # A per-tenant safety gate for the `decidim_importer:import` rake task. It is **off on every tenant
  # by default** and the import refuses to run unless it has been switched on for the target host — so
  # a large Decidim import can't be applied to the wrong tenant by accident. Enable it deliberately for
  # the target host in admin HQ once you've confirmed it is the right tenant.
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'decidim_importer'
    end

    def self.feature_title
      'Decidim importer'
    end

    def self.feature_description
      <<~DESC
        Allows the Decidim import task to apply an import to this tenant. Keep this off unless you
        intend to import into this specific host.
      DESC
    end

    # Off everywhere by default — the whole point is to require an explicit opt-in per host.
    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
