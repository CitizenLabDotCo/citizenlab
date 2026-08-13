# frozen_string_literal: true

require 'rails_helper'

# Tool definitions must not depend on tenant state: the cross-tenant staff gateway
# serves one tool list (fetched from a single reference tenant) to reach every tenant
# it proxies to. A tenant-specific constraint belongs in a call-time check with an
# actionable error (LocaleGuard, PhaseFeatureGuard), never in the definition. This
# spec fails when a tool (re)introduces definition-time tenant coupling.
RSpec.describe 'MCP tool definition parity' do # rubocop:disable RSpec/DescribeClass
  let(:current_user) { create(:super_admin) }

  def definitions
    McpServer::McpController::TOOL_CLASSES.map do |klass|
      klass.for(current_user: current_user, token_scopes: %w[mcp:access]).to_h
    end
  end

  def configure_tenant(locales:, features_on:)
    config = AppConfiguration.instance
    config.settings['core']['locales'] = locales
    config.save!

    features = %w[
      polls surveys common_ground konveio_document_annotation
      prescreening prescreening_ideation flag_inappropriate_content disable_disliking
    ]
    settings_service = SettingsService.new
    if features_on
      features.each { |feature| settings_service.activate_feature!(feature) }
    else
      with_dependers(features).each { |feature| settings_service.deactivate_feature!(feature) }
    end
  end

  # Deactivating a feature is rejected while active features depend on it (e.g. the
  # survey-provider features depend on 'surveys'), so deactivate dependers first.
  def with_dependers(features)
    dependencies = AppConfiguration::Settings.json_schema['dependencies']
    all = features.dup
    loop do
      dependers = dependencies.select { |_depender, dependees| dependees.intersect?(all) }.keys - all
      break if dependers.empty?

      all = dependers + all
    end
    all
  end

  it 'serves identical tool definitions regardless of tenant locales and feature flags' do
    configure_tenant(locales: %w[en], features_on: false)
    baseline = definitions

    # 'en' stays: dropping a locale that existing users have is rejected.
    configure_tenant(locales: %w[en fr-BE nl-BE], features_on: true)

    expect(definitions).to eq(baseline)
  end
end
