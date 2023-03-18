# frozen_string_literal: true

RSpec.shared_examples_for 'policy for blocked user' do |show: true|
  it { is_expected.to     permit(:show) } if show
  it { is_expected.not_to permit(:show) } unless show

  it { is_expected.not_to permit(:create) }
  it { is_expected.not_to permit(:update) }
  it { is_expected.not_to permit(:destroy) }
end

RSpec.shared_examples_for 'policy for blocked user vote' do |down_authorized: true|
  it { is_expected.not_to permit(:show) }
  it { is_expected.not_to permit(:create) }
  it { is_expected.not_to permit(:up) }

  it { is_expected.not_to permit(:down) } if down_authorized
  it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) } unless down_authorized

  it { is_expected.not_to permit(:destroy) }
end
