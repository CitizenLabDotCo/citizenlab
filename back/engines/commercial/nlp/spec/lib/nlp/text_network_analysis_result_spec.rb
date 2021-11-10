# frozen_string_literal: true

require 'rails_helper'
require 'nlp/text_network_analysis_result'

describe NLP::TextNetworkAnalysisResult do
  # rubocop:disable RSpec/MultipleMemoizedHelpers
  describe '.from_json' do
    subject(:tna_result) { described_class.from_json(json_result) }

    let(:status) { 'SUCCESS' }
    let(:tenant_id) { 'the-tenant-id' }
    let(:task_id) { 'the-task-id' }
    let(:locale) { 'the-locale' }
    let(:network) { build(:nlp_text_network) }

    let(:json_result) do
      {
        status: status,
        task_id: task_id,
        tenant_id: tenant_id,
        result: {
          data: {
            locale: locale,
            result: network.as_json
          }
        }
      }.to_json
    end

    context 'when the result is successful' do
      it { expect(tna_result).to be_success }
      it { expect(tna_result.tenant_id).to eq(tenant_id) }
      it { expect(tna_result.task_id).to eq(task_id) }
      it { expect(tna_result.locale).to eq(locale) }
      it { expect(tna_result.network).to eq(network) }
    end

    context 'when the result is not successful' do
      let(:status) { 'FAILURE' } # or anything that is not 'SUCCESS'

      it { expect(tna_result).not_to be_success }
      it { expect(tna_result.task_id).to eq(task_id) }
      it { expect(tna_result.tenant_id).to eq(tenant_id) }
    end
  end
  # rubocop:enable RSpec/MultipleMemoizedHelpers
end
