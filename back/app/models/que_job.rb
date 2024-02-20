# frozen_string_literal: true

# == Schema Information
#
# Table name: public.que_jobs
#
#  priority             :integer          default(100), not null
#  run_at               :timestamptz      not null
#  id                   :bigint           not null, primary key
#  job_class            :text             not null
#  error_count          :integer          default(0), not null
#  last_error_message   :text
#  queue                :text             default("default"), not null
#  last_error_backtrace :text
#  finished_at          :timestamptz
#  expired_at           :timestamptz
#  args                 :jsonb            not null
#  data                 :jsonb            not null
#  job_schema_version   :integer          default(1)
#
# Indexes
#
#  que_jobs_args_gin_idx                 (args) USING gin
#  que_jobs_data_gin_idx                 (data) USING gin
#  que_poll_idx                          (queue,priority,run_at,id) WHERE ((finished_at IS NULL) AND (expired_at IS NULL))
#  que_poll_idx_with_job_schema_version  (job_schema_version,queue,priority,run_at,id) WHERE ((finished_at IS NULL) AND (expired_at IS NULL))
#
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
