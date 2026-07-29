# frozen_string_literal: true

module DecidimImporter
  # Per-tenant safety gate for the `decidim_importer:import` rake task. Off on every tenant by default;
  # the import refuses to run unless it's switched on for the target host, so an import can't hit the
  # wrong tenant by accident. Enable it deliberately in admin HQ once the target host is confirmed.
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
        Allows the Decidim import rake task to apply an import to this tenant. Keep this off unless you
        intend to import from Decidim into this specific host.
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
