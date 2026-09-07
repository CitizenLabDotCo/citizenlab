# frozen_string_literal: true

require 'rails_helper'

# As Que::Locker runs in a separate thread, it uses not the same connection as AR in tests
# https://github.com/que-rb/que/blob/77c6b92952b821898c393239ce0e4047b17d7dae/lib/que/locker.rb#L158
RSpec.describe ApplicationJob, use_transactional_fixtures: false do
  describe '(with active-job que adapter)', :active_job_que_adapter do
    poll_interval = 0.1
    around do |example|
      locker = Que::Locker.new(poll_interval: poll_interval)
      example.run
      locker.stop!
    end

    # que uses poll to fetch some jobs, so we need to wait a bit
    # https://github.com/que-rb/que/blob/master/docs/README.md#poll-interval
    let(:wait_timeout) { poll_interval * 3 } # it's so high to prevent false failures.
    # Anyway `wait_until(wait_timeout)` won't wait so long for successfull cases.

    describe '#perform_retries' do
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
          sleep wait_timeout
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

    # Que only rescues StandardError. Without ActiveJobQueExtension#_run, the exception below would
    # kill the worker thread and, through abort_on_exception, the whole process (TAN-8516).
    describe 'when a job raises an exception that is not a StandardError' do
      around do |example|
        initial_retry_interval = Que::Job.retry_interval
        Que::Job.retry_interval = 0.001
        example.run
        Que::Job.retry_interval = initial_retry_interval
      end

      before do
        stub_const('TestNonStandardErrorJob', Class.new(ApplicationJob) do
          class_attribute :counter, default: 0

          def run
            self.class.counter += 1
            raise NotImplementedError, 'not supported'
          end
        end)
      end

      it 'keeps the worker alive and retries the job like any other failure' do
        TestNonStandardErrorJob.perform_later
        wait_until(wait_timeout) { TestNonStandardErrorJob.counter >= 2 }
        expect(TestNonStandardErrorJob.counter).to be >= 2
      end

      it 'records the original exception on the job' do
        que_job = QueJob.find(TestNonStandardErrorJob.perform_later.provider_job_id)
        wait_until(wait_timeout) { que_job.reload.error_count.positive? }
        expect(que_job.last_error_message).to include('NotImplementedError: not supported')
      end

      context 'when `perform_retries false`' do
        before { TestNonStandardErrorJob.perform_retries false }

        # Asserts what expiry means - the job stops running - rather than an exact run count, which
        # is not something the code guarantees: a failure inside `handle_error` is swallowed by
        # `ActiveJobQueExtension#_run`, which then falls through to `retry_in_default_interval`, so
        # a job can legitimately run again before an expire succeeds. Whether that is what made this
        # example flake on CI is unconfirmed - it reproduces when `expire` is stubbed to raise, but
        # the trigger on CI was never identified. The coarser poll is for the same reason: the tight
        # default competes with the worker thread for connections, and this example flakes where the
        # `perform_retries false` one above, which only sleeps, does not.
        it 'expires the job instead of retrying it' do
          que_job = QueJob.find(TestNonStandardErrorJob.perform_later.provider_job_id)
          wait_until(wait_timeout, interval: 0.05) { que_job.reload.expired_at.present? }
          runs_at_expiry = TestNonStandardErrorJob.counter

          sleep wait_timeout

          expect(TestNonStandardErrorJob.counter).to eq(runs_at_expiry)
          expect(que_job.reload.expired_at).to be_present
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

  describe '#destroy_in' do
    it 'marks the job as finished' do
      job = TestJob.new
      expect(job).to receive(:finish)
      job.destroy_in(1.minute)
    end

    it 'enqueues DeleteQueJobJob' do
      job = TestJob.new

      freeze_time do
        expect { job.destroy_in(1.minute) }
          .to enqueue_job(DeleteQueJobJob)
          .with(job.job_id)
          .at(1.minute.from_now)
      end
    end
  end
end
