# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::PublishedGraphDataUnitPolicy do
  subject { described_class.new(instance_double(User), data_unit) }

  let_it_be(:report) { create(:report, phase: build(:phase)) }
  let_it_be(:data_unit) { create(:published_graph_data_unit, report: report) }

  before do
    allow(ReportBuilder::ReportPolicy).to receive(:new).and_return(report_policy)
  end

  context 'when ReportPolicy#layout? returns true' do
    let(:report_policy) { instance_double(ReportBuilder::ReportPolicy, layout?: true) }

    it { is_expected.to permit(:published) }
  end

  context 'when ReportPolicy#layout? returns false' do
    let(:report_policy) { instance_double(ReportBuilder::ReportPolicy, layout?: false) }

    it { is_expected.not_to permit(:published) }
  end
end
