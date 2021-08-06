# frozen_string_literal: true

require 'rails_helper'

describe Insights::TextNetworkAnalysisService do
  subject(:service) { described_class.new }

  describe '#analyse' do
    subject(:service) { described_class.new(nlp_tna_service) }

    let(:nlp_tna_service) { instance_spy(NLP::TextNetworkAnalysisService, 'nlp_tna_service') }
    let(:view) { create(:view) }

    it 'delegates the analysis to NLP::TextNetworkAnalysisService' do
      allow(nlp_tna_service).to receive(:analyse).and_return({})
      service.analyse(view)

      expect(nlp_tna_service).to have_received(:analyse).with(view.scope, described_class)
    end

    it 'creates the task-view joint models', :aggregate_failures do
      tasks = create_list(:tna_task, 2, handler_class: described_class)
      languages = %w[en nl-BE]

      allow(nlp_tna_service).to receive(:analyse).and_return(Hash[languages.zip(tasks)])

      task_views = nil
      expect { task_views = service.analyse(view) }.to change { Insights::TextNetworkAnalysisTaskView.count }.by(2)

      expect(task_views.map(&:view).uniq).to eq([view])
      expect(task_views.map(&:task)).to eq(tasks)
      expect(task_views.pluck(:language)).to eq(languages)
    end

    it 'deletes existing networks for languages that are no longer in use' do
      text_network = create(:insights_text_network, language: 'nl-BE', view: view)
      allow(nlp_tna_service).to receive(:analyse).and_return({'en': create(:tna_task)})

      service.analyse(view)

      expect { text_network.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
