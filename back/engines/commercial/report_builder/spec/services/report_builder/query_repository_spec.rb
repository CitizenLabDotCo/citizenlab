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
  end
end
