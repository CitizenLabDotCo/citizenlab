# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'decidim_importer import safety gate' do # rubocop:disable RSpec/DescribeClass
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  before { Rake::Task['decidim_importer:import'].reenable }

  let(:host) { AppConfiguration.instance.host }

  # The feature is normally toggled through admin HQ; here we set it directly on the app config.
  def enable_feature!
    config = AppConfiguration.instance
    config.settings = config.settings.merge('decidim_importer' => { 'allowed' => true, 'enabled' => true })
    config.save!
  end

  it 'aborts before touching anything when the feature is off (the default)' do
    expect(AppConfiguration.instance).not_to be_feature_activated('decidim_importer')
    expect { Rake::Task['decidim_importer:import'].invoke('nonexistent.template.yml', host) }
      .to raise_error(SystemExit)
  end

  it 'lets the import past the gate once the feature is enabled (then fails on the missing file, not the gate)' do
    enable_feature!
    # Past the gate it reads the template file, so a missing file raises Errno::ENOENT, not SystemExit.
    expect { Rake::Task['decidim_importer:import'].invoke('nonexistent.template.yml', host) }
      .to raise_error(Errno::ENOENT)
  end
end
