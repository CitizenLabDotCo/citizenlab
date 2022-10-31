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
end
