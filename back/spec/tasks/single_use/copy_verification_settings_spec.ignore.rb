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
    @methods = [
      { 'name' => 'acm', 'rrn_result_custom_field_key' => 'some_key' },
      { 'name' => 'fake_sso', issuer: 'http://example.com', enabled_for_verified_actions: true }
    ]
    settings = AppConfiguration.instance.settings
    settings['verification']['verification_methods'] = @methods
    Current.app_configuration.update!(settings: settings)
  end

  it 'does not copy verification settings if dry run' do
    run_task(execute: false)

    expect(settings['id_config']).to be_nil
    expect(settings['verification']['verification_methods']).to eq(@methods)
  end

  it 'copies verification settings to id_config if execute' do
    run_task(execute: true)

    expect(settings['id_config']).to eq({
      'id_methods' => @methods
    })
    expect(settings['verification']['verification_methods']).to eq(@methods)
  end
end
# rubocop:enable RSpec/DescribeClass
