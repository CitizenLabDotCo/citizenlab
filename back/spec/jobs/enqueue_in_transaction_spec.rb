# frozen_string_literal: true

require 'rails_helper'

# Jobs are enqueued straight away, inside the open transaction, and not deferred until it
# commits. Rails 7.2 made deferring possible and config/initializers/que.rb turns it off for the
# Que adapter, so these specs guard that behaviour when the patch changes or goes away.
RSpec.describe 'Enqueueing a job inside a transaction', :active_job_que_adapter do # rubocop:disable RSpec/DescribeClass
  # Que writes jobs with its own SQL, which does not clear the query cache that wraps each example.
  def job_count
    ActiveRecord::Base.uncached { QueJob.count }
  end

  it 'writes the job before the transaction commits' do
    ActiveRecord::Base.transaction(requires_new: true) do
      expect { TestJob.perform_later }.to change { job_count }.by(1)
    end
  end

  it 'keeps the job when the transaction commits' do
    expect do
      ActiveRecord::Base.transaction(requires_new: true) { TestJob.perform_later }
    end.to change { job_count }.by(1)
  end

  it 'drops the job when the transaction rolls back' do
    expect do
      ActiveRecord::Base.transaction(requires_new: true) do
        TestJob.perform_later
        raise ActiveRecord::Rollback
      end
    end.not_to change { job_count }
  end
end
