# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CitizenLab::LockManager do
  describe '.try_with_transaction_lock', use_transactional_fixtures: false do
    it 'raises an error if the lock is not available' do
      lock_name = 'lock-name'
      block_new_thread = true
      block_main_thread = true

      thread = Thread.new do
        described_class.try_with_transaction_lock(lock_name) do
          block_main_thread = false
          sleep(1e-2) while block_new_thread
        end
      end

      # We suspend the main thread until the new thread has acquired the lock.
      sleep(1e-2) while block_main_thread
      expect { described_class.try_with_transaction_lock(lock_name) { nil } }
        .to raise_error(CitizenLab::LockManager::FailedToLock)

      block_new_thread = false
      thread.join
    end

    it 'releases the lock after running the block' do
      lock_name = 'lock-name'
      described_class.try_with_transaction_lock(lock_name) { :do_nothing }

      # The lock should be available again.
      expect { described_class.try_with_transaction_lock(lock_name) { :do_nothing } }
        .not_to raise_error
    end

    it 'returns the result of the block' do
      result = described_class.try_with_transaction_lock('lock-name') { :result }
      expect(result).to eq(:result)
    end
  end

  describe '.with_transaction_lock', use_transactional_fixtures: false do
    it 'waits until the lock is released' do
      lock_name = 'lock-name'
      events = Queue.new
      locked = Queue.new
      release = Queue.new

      thread = Thread.new do
        described_class.with_transaction_lock(lock_name) do
          locked << true
          release.pop
          events << :first_released
        end
      end

      locked.pop
      waiting = Thread.new do
        described_class.with_transaction_lock(lock_name) { events << :second_locked }
      end
      sleep 0.1
      release << true
      [thread, waiting].each(&:join)

      expect(Array.new(events.size) { events.pop }).to eq %i[first_released second_locked]
    end

    it 'returns the result of the block' do
      result = described_class.with_transaction_lock('lock-name') { :result }
      expect(result).to eq(:result)
    end

    it 'stops waiting after the timeout' do
      lock_name = 'lock-name'
      locked = Queue.new
      release = Queue.new

      thread = Thread.new do
        described_class.with_transaction_lock(lock_name) do
          locked << true
          release.pop
        end
      end

      locked.pop
      expect { described_class.with_transaction_lock(lock_name, timeout: 0.1.seconds) { nil } }
        .to raise_error(ActiveRecord::LockWaitTimeout)

      release << true
      thread.join
    end

    it 'restores the lock timeout once the lock is taken' do
      timeout_in_block = described_class.with_transaction_lock('lock-name', timeout: 5.seconds) do
        ActiveRecord::Base.connection.select_value("SELECT current_setting('lock_timeout')")
      end

      expect(timeout_in_block).to eq '0'
    end
  end
end
