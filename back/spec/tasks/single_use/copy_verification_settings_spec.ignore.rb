# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:copy_verification_settings rake task' do
  before { load_rake_tasks_if_not_loaded }
  after { Rake::Task['single_use:copy_verification_settings'].reenable }

  def run_task(execute: false)
    Rake::Task['single_use:copy_verification_settings'].invoke(execute ? 'execute' : nil)
  end

  before do
    # String keys throughout: settings are persisted to a jsonb column, so they
    # always come back string-keyed after a round-trip through the database.
    @methods = [
      { 'name' => 'acm', 'rrn_result_custom_field_key' => 'some_key' },
      { 'name' => 'fake_sso', 'issuer' => 'http://example.com', 'enabled_for_verified_actions' => true }
    ]
    settings = AppConfiguration.instance.settings
    settings['verification']['verification_methods'] = @methods
    AppConfiguration.instance.update!(settings: settings)
  end

  it 'does not copy verification settings if dry run' do
    run_task(execute: false)

    # Re-read from the DB: the rake task switches tenants, which resets the
    # cached AppConfiguration, so it operates on a fresh settings hash.
    settings = AppConfiguration.instance.reload.settings
    expect(settings['id_config']).to eq({})
    expect(settings.dig('verification', 'verification_methods')).to eq(@methods)
  end

  it 'copies verification settings to id_config if execute' do
    run_task(execute: true)

    settings = AppConfiguration.instance.reload.settings
    expect(settings['id_config']).to eq({
      'id_methods' => @methods
    })
    expect(settings.dig('verification', 'verification_methods')).to eq(@methods)
  end
end
# rubocop:enable RSpec/DescribeClass
