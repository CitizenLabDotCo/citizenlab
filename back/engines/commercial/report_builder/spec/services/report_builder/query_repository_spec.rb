# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::QueryRepository do
  let(:query_repository) { described_class.new(build(:user)) }
  let(:props) { {} }

  describe '#data_by_graph' do
    context 'when graph_resolved_name is valid' do
      let(:graph_resolved_name) { 'VisitorsWidget' }

      it 'runs query and returns results' do
        expect(query_repository.data_by_graph(graph_resolved_name, props)).to be_present
      end
    end

    context 'when graph_resolved_name is invalid' do
      let(:graph_resolved_name) { 'InvalidWidget' }

      it 'returns nil' do
        expect(query_repository.data_by_graph(graph_resolved_name, props)).to be_nil
      end
    end

    describe 'exclude_admins_and_moderators' do
      let(:graph_resolved_name) { 'VisitorsWidget' }
      let(:props) { { 'excludeAdminsAndModerators' => true, 'resolution' => 'month' } }

      it 'ignores exclude_admins_and_moderators from the props when the setting is disabled' do
        expect_any_instance_of(ReportBuilder::Queries::Visitors)
          .to receive(:run_query).with(exclude_admins_and_moderators: false, resolution: 'month')

        query_repository.data_by_graph(graph_resolved_name, props)
      end

      it 'passes exclude_admins_and_moderators when the setting is enabled' do
        enable_exclude_admins_and_moderators_from_statistics

        expect_any_instance_of(ReportBuilder::Queries::Visitors)
          .to receive(:run_query).with(exclude_admins_and_moderators: true, resolution: 'month')

        query_repository.data_by_graph(graph_resolved_name, { 'resolution' => 'month' })
      end
    end
  end
end
