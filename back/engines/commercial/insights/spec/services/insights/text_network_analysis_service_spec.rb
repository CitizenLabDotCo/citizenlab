# frozen_string_literal: true

require 'rails_helper'

describe Insights::TextNetworkAnalysisService do
  subject(:service) { described_class.new }

  describe '#handle' do
    let(:task_view) { create(:tna_task_view) }
    let(:tna_task) { task_view.task }
    let(:tna_result) { build(:tna_result, tenant_id: Tenant.current.id, task_id: tna_task.task_id) }

    it 'stores the text network' do
      expect { service.handle(tna_task, tna_result) }.to change { Insights::TextNetwork.count }.by(1)

      text_network = Insights::TextNetwork.find_by(view: task_view.view, language: tna_result.locale)
      expect(text_network.network).to eq(tna_result.network)
    end

    context 'when a network already exists for that view-language combination' do
      let!(:insights_text_network) do
        another_network = build(:nlp_text_network, nb_nodes: 7)
        create(:insights_text_network, view: task_view.view, language: tna_result.locale, network: another_network)
      end

      it 'replaces the text network', :aggregate_failures do
        expect { service.handle(tna_task, tna_result) }.to(change { insights_text_network.reload.updated_at })
        expect(insights_text_network.network).to eq(tna_result.network)
      end
    end

    context 'when the task is not successful' do
      before { tna_result.instance_variable_set(:@is_success, false) }

      it 'does nothing' do
        expect { service.handle(tna_task, tna_result) }.not_to(change { Insights::TextNetwork.count })
      end
    end
  end

  describe '#analyse' do
    subject(:service) { described_class.new(nlp_tna_service) }

    let_it_be(:view) do
      create(:view, nb_data_sources: 2).tap do |view|
        # each data source has an input
        view.data_sources.each { |ds| create(:idea, project: ds.origin) }
      end
    end

    let(:nlp_tna_service) { instance_spy(NLP::TextNetworkAnalysisService, 'nlp_tna_service') }

    it 'delegates the analysis to NLP::TextNetworkAnalysisService' do
      expect(nlp_tna_service).to receive(:analyse) do |inputs, handler_class|
        expect(handler_class).to eq(described_class)
        expect(inputs).to match_array(Insights::InputsFinder.new(view).execute)
      end.and_return({})

      service.analyse(view)
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
      allow(nlp_tna_service).to receive(:analyse).and_return({ 'en': create(:tna_task) })

      service.analyse(view)

      expect { text_network.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
