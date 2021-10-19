require 'rails_helper'

RSpec.describe ApplicationJob, type: :job, use_transactional_fixtures: false do
  around do |example|
    initial_queue_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :que
    example.run
    ActiveJob::Base.queue_adapter = initial_queue_adapter
  end

  around do |example|
    locker = Que::Locker.new
    example.run
    locker.stop!
  end

  let(:wait_timeout) { 20 } # it's so high to prevent false failures.
  # Anyway `wait_until(wait_timeout)` won't wait so long for successfull cases.

  describe '#perform_retries', slow_test: true do
    around do |example|
      initial_retry_interval = Que::Job.retry_interval
      Que::Job.retry_interval = 0.001 # retry immediately, but avoid possible special cases with 0
      example.run
      Que::Job.retry_interval = initial_retry_interval
    end

    context 'when `perform_retries false`' do
      before do
        stub_const('TestPerformRetriesJob', Class.new(ApplicationJob) do
          class_attribute :counter, default: 0
          perform_retries false

          def run
            self.class.counter += 1
            no_such_method
          end
        end)
      end

      it 'stops jobs from being retried' do
        TestPerformRetriesJob.perform_later
        sleep 8 # que is quite slow. We give it time to perform second job.
        # If you want to decrease it, first test that other tests in this context
        # can pass with your new timeout (set in `wait_timeout`) used here.
        # They always fail with wait_timeout of 5 seconds and always pass with 6.
        # 2 seconds are added (6+2=8) for more reliability.
        expect(TestPerformRetriesJob.counter).to eq(1)
      end
    end

    context 'when `perform_retries true`' do
      before do
        stub_const('TestPerformRetriesJob', Class.new(ApplicationJob) do
          class_attribute :counter, default: 0
          perform_retries true

          def run
            self.class.counter += 1
            no_such_method
          end
        end)
      end

      it 'retries jobs' do
        TestPerformRetriesJob.perform_later
        wait_until(wait_timeout) { TestPerformRetriesJob.counter == 2 }
        expect(TestPerformRetriesJob.counter).to eq(2)
      end
    end

    context 'when `perform_retries true` is inherited' do
      before do
        stub_const('TestPerformRetriesJob', Class.new(ApplicationJob) do
          class_attribute :counter, default: 0

          def run
            self.class.counter += 1
            no_such_method
          end
        end)
      end

      it 'retries jobs' do
        TestPerformRetriesJob.perform_later
        wait_until(wait_timeout) { TestPerformRetriesJob.counter == 2 }
        expect(TestPerformRetriesJob.counter).to eq(2)
      end
    end
  end

  describe 'error tracking' do
    context 'when job raises error' do
      before do
        stub_const('TestErrorsTrackingJob', Class.new(ApplicationJob) do
          def run
            no_such_method
          end
        end)
      end

      it 'sends errors to sentry' do
        expect(Sentry::Rails).to receive(:capture_exception)
        expect { TestErrorsTrackingJob.perform_now }.to raise_error(NameError)
      end

      it 'sends errors to sentry in background' do
        expect(Sentry::Rails).to receive(:capture_exception)
        TestErrorsTrackingJob.perform_later
        wait_until(wait_timeout) { messages_received(Sentry::Rails).present? }
      end
    end

    context 'when job does not raise error' do
      before do
        stub_const('TestErrorsTrackingJob', Class.new(ApplicationJob) do
          class_attribute :performed, default: false

          def run
            self.class.performed = true
          end
        end)
      end

      it 'does not send errors to sentry' do
        expect(Sentry::Rails).not_to receive(:capture_exception)
        TestErrorsTrackingJob.perform_now
      end

      it 'does not send errors to sentry in background' do
        expect(Sentry::Rails).not_to receive(:capture_exception)
        TestErrorsTrackingJob.perform_later
        wait_until(wait_timeout) { TestErrorsTrackingJob.performed }
      end
    end
  end
end
