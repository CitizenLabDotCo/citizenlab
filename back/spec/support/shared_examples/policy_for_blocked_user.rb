# frozen_string_literal: true

RSpec.shared_examples_for 'policy for blocked user' do |show: true, destroy: false, skip: nil|
  before do
    settings = AppConfiguration.instance.settings
    settings['user_blocking'] = { 'enabled' => true, 'allowed' => true, 'duration' => 90 }
    AppConfiguration.instance.update!(settings: settings)
  end

  it { is_expected.to     permit(:show) } if show
  it { is_expected.not_to permit(:show) } unless show

  it { is_expected.not_to permit(:create) } unless skip == 'create'

  it { is_expected.not_to permit(:update) }

  it { is_expected.to     permit(:destroy) } if destroy
  it { is_expected.not_to permit(:destroy) } unless destroy
end

RSpec.shared_examples_for 'policy for blocked user vote' do |down_not_authorized: false|
  before do
    settings = AppConfiguration.instance.settings
    settings['user_blocking'] = { 'enabled' => true, 'allowed' => true, 'duration' => 90 }
    AppConfiguration.instance.update!(settings: settings)
  end

  it { is_expected.not_to permit(:show) }
  it { is_expected.not_to permit(:create) }
  it { is_expected.not_to permit(:up) }

  it { is_expected.not_to permit(:down) } unless down_not_authorized
  it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) } if down_not_authorized

  it { is_expected.not_to permit(:destroy) }
end
