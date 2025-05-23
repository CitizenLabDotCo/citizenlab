# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jobs::TrackerPolicy do
  subject { described_class.new(user, job_tracker) }

  let(:job_tracker) { create(:jobs_tracker) }
  let(:scope) { described_class::Scope.new(user, Jobs::Tracker) }

  context 'when the user is an admin' do
    let_it_be(:user) { create(:admin) }

    it { is_expected.to permit(:show) }

    it 'scopes are not filtered' do
      create_pair(:jobs_tracker)
      expect(scope.resolve.count).to eq(2)
    end
  end

  context 'when the user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.to permit(:show) }

    it 'scopes are filtered' do
      create_pair(:jobs_tracker)
      expect(scope.resolve.count).to eq(0)
    end
  end
end
