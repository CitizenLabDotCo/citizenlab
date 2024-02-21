# frozen_string_literal: true

require 'que/active_record/model'

class QueJob < Que::ActiveRecord::Model
  def self.find(id)
    by_args(job_id: id).sole
  end

  def args
    super.first.with_indifferent_access
  end

  def status
    return :finished if finished_at
    return :expired  if expired_at
    return :errored  if error_count.positive?
    return :scheduled if run_at > Time.now

    :pending
  end
end
