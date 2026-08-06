# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CitizenLab::Que::AivenPgSecurityCompat do
  def normalize_sql(sql)
    sql.gsub(/\s+/, ' ').strip
  end

  # Detects drift from que's original clean_lockers query.
  it "patches the expected version of que's clean_lockers query" do
    original_sql = <<~SQL.squish
      DELETE FROM public.que_lockers
      WHERE pid = pg_backend_pid()
         OR NOT EXISTS (SELECT 1 FROM pg_stat_activity WHERE pid = public.que_lockers.pid)
    SQL

    message = <<~MSG
      que's clean_lockers query changed (likely a `bundle update que`).
      Re-check that CLEAN_LOCKERS_SQL is still an equivalent, pg_authid-free
      rewrite of the new query.
    MSG

    expect(normalize_sql(Que::SQL[:clean_lockers]))
      .to eq(normalize_sql(original_sql)), message
  end

  describe '.apply!' do
    let(:connection) { ActiveRecord::Base.connection }

    # apply! mutates the global Que::SQL hash, so restore the stock query
    # afterwards to keep other specs isolated.
    around do |example|
      original = Que::SQL[:clean_lockers]
      example.run
    ensure
      Que::SQL[:clean_lockers] = original
    end

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
      described_class.apply!
      own_pid  = connection.execute('SELECT pg_backend_pid() AS pid').first['pid']
      dead_pid = 2_147_483_647 # max int4, never a real backend pid
      insert_lockers([own_pid, dead_pid])

      Que.execute(:clean_lockers)

      expect(locker_pids).to be_empty
    end
  end
end
