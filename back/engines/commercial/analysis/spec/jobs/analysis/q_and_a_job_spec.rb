# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::QAndAJob do
  subject(:job) { described_class.new }

  let(:question) { create(:analysis_question) }
  let(:analysis) { question.analysis }
  let(:project) { analysis.project }
  let(:background_task) { question.background_task }

  describe '#handle_error' do
    context 'with PreviewPendingError' do
      let(:error) { Analysis::LLM::PreviewPendingError.new }

      it 'retries in 15 seconds' do
        expect(job).to receive(:retry_in).with(15.seconds) # rubocop:disable RSpec/SubjectStub
        job.handle_error(error)
      end
    end

    context 'with TooManyRequestsError' do
      let(:error) { Analysis::LLM::TooManyRequestsError.new }

      it 'retries in 1 minute' do
        expect(job).to receive(:retry_in).with(1.minute) # rubocop:disable RSpec/SubjectStub
        job.handle_error(error)
      end
    end

    shared_examples 'expires on error' do |error_class|
      context "with #{error_class.name}" do
        it 'expires and marks task as failed' do
          job.instance_variable_set(:@question, question)
          error = error_class.new

          expect(job).to receive(:expire).and_call_original # rubocop:disable RSpec/SubjectStub
          job.handle_error(error)

          background_task.reload
          expect(background_task.state).to eq('failed')
          expect(background_task.last_error_class).to eq(error.class.name)
        end
      end
    end

    described_class::UNRECOVERABLE_ERRORS.each do |error_class|
      include_examples 'expires on error', error_class
    end
  end
end
