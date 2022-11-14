# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportPolicy do
  subject { described_class.new(user, report) }

  let_it_be(:all_reports) { create_list(:report, 3) }
  let_it_be(:report) { all_reports.first }

  let(:scope) { described_class::Scope.new(user, ReportBuilder::Report) }

  context 'when the user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:update) }
    it { expect(scope.resolve.count).to eq(3) }
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end
end
