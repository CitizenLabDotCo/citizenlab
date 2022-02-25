# frozen_string_literal: true

require 'rails_helper'

describe NLP::TextNetworkAnalysisService do
  describe '.handle_result' do
    let(:test_tenant) { Tenant.find_by(name: 'test-tenant') }
    let!(:tna_result) { build(:tna_result) }

    context 'when the task is unknown' do
      it 'passes but does nothing' do
        Apartment::Tenant.reset
        expect { described_class.handle_result(tna_result) }.not_to raise_error
      end
    end

    context 'when the task is known' do
      let!(:tna_task) { create(:tna_task, task_id: tna_result.task_id) }

      it 'delegates the result processing to the handler and removes the task' do
        Apartment::Tenant.reset
        handler = instance_spy(NLP::Testing::DummyTaskHandler, 'task_handler')
        allow(NLP::Testing::DummyTaskHandler).to receive(:new).and_return(handler)

        described_class.handle_result(tna_result)

        expect(handler).to have_received(:handle)
        expect { tna_task.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#analyse' do
    subject(:service) { described_class.new(nlp_client) }

    let(:nlp_client) { instance_spy(NLP::Api, 'nlp_client') }
    let(:inputs) { create_list(:idea, 2) }
    let(:handler_class) { NLP::Testing::DummyTaskHandler }

    context 'when there is no input to be analysed' do
      it 'does not send a TNA request' do
        service.analyse([], handler_class) # we don't care about the handler class
        expect(nlp_client).not_to have_received(:text_network_analysis)
      end
    end

    context 'when there are inputs to be analysed' do
      let(:locales) { %w[en nl-BE] }

      it 'sends TNA requests and creates TNA tasks' do
        tasks_by_language = locales.index_with { |locale| "tna-task-#{locale}" }
        task_ids = tasks_by_language.values # identifiers returned by the NLP API

        expect(nlp_client).to receive(:text_network_analysis)
                                .with(Tenant.current.id, inputs.pluck(:id))
                                .and_return(tasks_by_language)

        task_by_locale = service.analyse(inputs, handler_class)
        tna_tasks = task_by_locale.values

        aggregate_failures('checking tasks') do
          expect(tna_tasks).to all(be_valid)
          expect(tna_tasks.pluck(:task_id)).to match_array(task_ids)
          expect(tna_tasks.pluck(:handler_class).uniq).to eq([handler_class.name])
          expect(task_by_locale.keys).to match_array(locales)
        end
      end
    end
  end
end
