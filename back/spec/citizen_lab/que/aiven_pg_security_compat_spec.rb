# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CitizenLab::Que::AivenPgSecurityCompat do
  describe 'CLEAN_LOCKERS_SQL' do
    let(:connection) { ActiveRecord::Base.connection }

    def insert_lockers(pids)
      values = pids.map { |pid| "(#{pid}, 1, '{1}', 1, 'test-host', '{default}', false)" }.join(', ')

      connection.execute(<<~SQL.squish)
        INSERT INTO public.que_lockers
          (pid, worker_count, worker_priorities, ruby_pid, ruby_hostname, queues, listening)
        VALUES #{values}
      SQL
    end

    def locker_pids
      connection.execute('SELECT pid FROM public.que_lockers').map { |r| r['pid'] }
    end

    # clean_lockers runs at worker startup, before the worker re-registers. It
    # removes both the current connection's own locker (so a fresh one can be
    # registered) and lockers left by dead workers (pid no longer active).
    it 'removes the current connection\'s locker and lockers of dead backends' do
      own_pid  = connection.execute('SELECT pg_backend_pid() AS pid').first['pid']
      dead_pid = 2_147_483_647 # max int4, never a real backend pid
      insert_lockers([own_pid, dead_pid])

      connection.execute(described_class::CLEAN_LOCKERS_SQL)

      expect(locker_pids).to be_empty
    end
  end
end
