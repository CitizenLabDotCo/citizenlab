# frozen_string_literal: true

RSpec.shared_context 'when user_blocking duration is 90 days' do
  before do
    settings = AppConfiguration.instance.settings
    settings['user_blocking'] = { 'enabled' => true, 'allowed' => true, 'duration' => 90 }
    AppConfiguration.instance.update!(settings: settings)
  end
end
