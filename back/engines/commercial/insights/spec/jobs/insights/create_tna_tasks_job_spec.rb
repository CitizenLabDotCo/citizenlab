# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::CreateTnaTasksJob do
  subject(:job) { described_class.new }

  let(:view) { build(:view) }

  describe '#perform' do
    it 'request TNA analysis' do
      tna_service = instance_spy(Insights::TextNetworkAnalysisService, 'tna_service')
      allow(Insights::TextNetworkAnalysisService).to receive(:new).and_return(tna_service)

      job.perform(view)

      expect(tna_service).to have_received(:analyse).with(view)
    end
  end
end
