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
#  job_schema_version   :integer          not null
#  kwargs               :jsonb            not null
#
# Indexes
#
#  que_jobs_args_gin_idx    (args) USING gin
#  que_jobs_data_gin_idx    (data) USING gin
#  que_jobs_kwargs_gin_idx  (kwargs) USING gin
#  que_poll_idx             (job_schema_version,queue,priority,run_at,id) WHERE ((finished_at IS NULL) AND (expired_at IS NULL))
#
require 'que/active_record/model'

class QueJob < Que::ActiveRecord::Model
  class << self
    def by_job_id!(job_id)
      by_args({ job_id: }).sole
    end

    def all_by_job_ids(job_ids)
      ids = job_ids.map { |job_id| [{ job_id: }].to_json }
      where('args @> ANY (ARRAY[?]::jsonb[])', ids)
    end

    def all_by_tenant_schema_name(tenant_schema_name)
      by_args({ tenant_schema_name: }).all
    end
  end

  def args
    super.first.with_indifferent_access
  end

  def active?
    %i[pending scheduled].include?(status)
  end
  alias active active?

  def failed?
    %i[expired errored].include?(status)
  end
  alias failed failed?

  def status
    return :finished if finished_at
    return :expired  if expired_at
    return :errored  if error_count.positive?
    return :scheduled if run_at > Time.now

    :pending
  end

  # return a formatted error hash - but only for those we have deliberately caught - only bulk_import currently
  def last_error
    # Link to bulk import error throwing
    if last_error_message
      last_error_string = last_error_message.split(': ')&.last
      return { error: 'uncaught_error' } unless last_error_string&.start_with?('bulk_import_')

      # Additional error values are separated by '##' - See BulkImportIdeas::Error
      split_error_params = last_error_string&.split('##')
      if split_error_params&.length&.> 1
        { error: split_error_params[0], value: split_error_params[1], row: split_error_params[2] }
      else
        { error: split_error_params[0] }
      end
    end
  end
end
