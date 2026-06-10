# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:remove_obsolete_settings rake task' do
  let(:obsolete_keys) do
    %w[verification facebook_login google_login azure_ad_login azure_ad_b2c_login]
  end

  before do
    load_rake_tasks_if_not_loaded

    settings = AppConfiguration.instance.settings
    obsolete_keys.each do |key|
      settings[key] = { 'allowed' => true, 'enabled' => true }
    end
    # The obsolete keys are no longer part of the settings schema, so a normal
    # `update!` would be rejected by validation. Write straight to the DB to
    # recreate the legacy state the task is meant to clean up.
    AppConfiguration.instance.update_column(:settings, settings)
  end

  after { Rake::Task['single_use:remove_obsolete_settings'].reenable }

  def run_task(execute: false)
    Rake::Task['single_use:remove_obsolete_settings'].invoke(execute ? 'execute' : nil)
  end

  it 'does not remove obsolete settings if dry run' do
    run_task(execute: false)

    # Re-read from the DB: the rake task switches tenants, which resets the
    # cached AppConfiguration, so it operates on a fresh settings hash.
    settings = AppConfiguration.instance.reload.settings
    obsolete_keys.each do |key|
      expect(settings).to have_key(key)
    end
  end

  it 'removes obsolete settings if execute' do
    run_task(execute: true)

    settings = AppConfiguration.instance.reload.settings
    obsolete_keys.each do |key|
      expect(settings).not_to have_key(key)
    end
  end

  it 'leaves other settings untouched if execute' do
    run_task(execute: true)

    settings = AppConfiguration.instance.reload.settings
    expect(settings).to have_key('core')
  end
end
# rubocop:enable RSpec/DescribeClass
