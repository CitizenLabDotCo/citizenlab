# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::ReportingQueryPolicy do
  subject(:policy) { described_class.new(user, :reporting_query) }

  before { SettingsService.new.activate_feature!('llm_reporting') }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:create) }
  end

  # The one that matters: this endpoint runs SQL the model wrote, over the whole
  # platform's reporting data.
  context 'for a regular user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:create) }
  end

  context 'for a project moderator' do
    let(:user) { create(:project_moderator) }

    it { is_expected.not_to permit(:create) }
  end

  context 'for an admin who has not finished registering' do
    let(:user) { create(:admin).tap { |admin| admin.update_columns(registration_completed_at: nil) } }

    it { is_expected.not_to permit(:create) }
  end

  context 'for a blocked admin' do
    let(:user) { create(:admin, block_end_at: 1.day.from_now) }

    it { is_expected.not_to permit(:create) }
  end

  context 'for an active admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:create) }

    context 'when the feature is not activated' do
      before { SettingsService.new.deactivate_feature!('llm_reporting') }

      it { is_expected.not_to permit(:create) }
    end
  end
end
