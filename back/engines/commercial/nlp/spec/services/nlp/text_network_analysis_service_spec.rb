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

      # rubocop:disable RSpec/MultipleExpectations
      it 'delegates the result processing to the handler and removes the task' do
        Apartment::Tenant.reset
        handler = instance_spy(NLP::Testing::DummyTaskHandler, 'task_handler')
        allow(NLP::Testing::DummyTaskHandler).to receive(:new).and_return(handler)

        described_class.handle_result(tna_result)

        expect(handler).to have_received(:handle)
        expect { tna_task.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
      # rubocop:enable RSpec/MultipleExpectations
    end
  end

  describe '#analyse' do
    subject(:service) { described_class.new(nlp_client) }

    let(:nlp_client) { instance_spy(NLP::Api, 'nlp_client') }
    let(:project) { create(:project) }
    let(:handler_class) { NLP::Testing::DummyTaskHandler }

    context 'when the project has no ideas' do
      it 'does not send a TNA request' do
        service.analyse(project, handler_class) # we don't care about the handler task
        expect(nlp_client).not_to have_received(:text_network_analysis)
      end
    end

    context 'when the project has ideas' do
      let(:locales) { %w[en nl-BE] }

      before do
        locales.map { |locale| create(:idea, project: project, body_multiloc: { locale => '...' }) }
      end

      # rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations
      it 'sends TNA requests and creates TNA tasks' do
        task_ids = locales.map do |locale|
          nlp_task_id = "#{locale}-task-id"
          expect(nlp_client).to receive(:text_network_analysis).with(Tenant.current.id, project.id, locale)
                                                               .and_return(nlp_task_id)
          nlp_task_id
        end

        task_by_locale = service.analyse(project, handler_class)
        tna_tasks = task_by_locale.values

        aggregate_failures("checking tasks") do
          expect(tna_tasks).to all(be_valid)
          expect(tna_tasks.pluck(:task_id)).to match_array(task_ids)
          expect(tna_tasks.pluck(:handler_class).uniq).to eq([handler_class.name])
          expect(task_by_locale.keys).to match_array(locales)
        end
      end
      # rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
    end
  end
end
