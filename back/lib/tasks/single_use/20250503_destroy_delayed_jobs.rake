# Tasks to investigate and remove a large set of que_jobs records that were
# created (enqueued) in March and April 2024, but given `run_at` dates
# far into the future, such that they will be variously executed from now
# until 2032! In many cases, this can result in people receiving extremely
# outdated emails, in turn resulting in a number of customer complaints.

namespace :single_use do
  # Example output:
  #
  # --- Distinct que_jobs job Classes and Their Counts ---
  # Found 10 current que_jobs records with run_at dates more than 1 month after their enqueued_at date.
  # From a total of 13 current Quque_jobseJob records. [not expired, not finished]
  # 6: "LogActivityJob"
  # 4: "ExpireConfirmationCodeOrDeleteJob"
  task delayed_jobs_stats: :environment do
    current_que_jobs = QueJob.where(expired_at: nil).where(finished_at: nil).select(:id, :run_at, :args).to_a

    found = 0
    job_class_counts = {}

    current_que_jobs.each do |job|
      run_at_time = job.run_at
      enqueued_at_time = nil

      if job.args.is_a?(Hash) && job.args.key?('enqueued_at')
        begin
          enqueued_at_time = Time.parse(job.args['enqueued_at'])
        rescue ArgumentError
          next
        end
      end

      if run_at_time.present? && enqueued_at_time.present?
        time_diff_seconds = run_at_time - enqueued_at_time

        if time_diff_seconds > 1.month.to_i
          found += 1
          job_class_name = job.args['job_class']
          job_class_counts[job_class_name] = (job_class_counts[job_class_name] || 0) + 1
        end
      end
    end

    puts "\n--- Distinct que_jobs job Classes and Their Counts ---"

    if job_class_counts.empty?
      puts 'No que_jobs records found.'
    else
      puts "Found #{found} current que_jobs records with run_at dates more than 1 month after their enqueued_at date."
      puts "From a total of #{current_que_jobs.count} current que_jobs records. [not expired, not finished]"
      job_class_counts.sort_by { |_name, count| count }.reverse_each do |name, count|
        puts "#{count}: #{name.inspect}"
      end
    end

    puts
  end

  # Example output:
  #
  # --- que_jobs with `run_at` > 1 Month after `enqueued_at` (Sorted by Delay) ---
  # 1: Job ID: 107, Run At: 2026-06-03 18:01:25 UTC, Enqueued At: 2025-06-03 18:01:25 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.97639224678278 seconds
  # 2: Job ID: 110, Run At: 2026-06-03 18:03:57 UTC, Enqueued At: 2025-06-03 18:03:57 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.99890432879329 seconds
  # 3: Job ID: 108, Run At: 2026-06-03 18:02:16 UTC, Enqueued At: 2025-06-03 18:02:16 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.999295487999916 seconds
  # 4: Job ID: 95, Run At: 2026-06-03 17:55:13 UTC, Enqueued At: 2025-06-03 17:55:13 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.99931048974395 seconds
  # 5: Job ID: 89, Run At: 2026-06-03 17:49:10 UTC, Enqueued At: 2025-06-03 17:49:10 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.99955515563488 seconds
  # 6: Job ID: 109, Run At: 2026-06-03 18:02:38 UTC, Enqueued At: 2025-06-03 18:02:38 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.99970220029354 seconds
  # 7: Job ID: 90, Run At: 2026-06-03 17:49:10 UTC, Enqueued At: 2025-06-03 17:49:10 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.99973940849304 seconds
  # 8: Job ID: 63, Run At: 2026-06-03 17:46:22 UTC, Enqueued At: 2025-06-03 17:46:22 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.99979120865464 seconds
  # 9: Job ID: 81, Run At: 2026-06-03 17:48:11 UTC, Enqueued At: 2025-06-03 17:48:11 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.99979778006673 seconds
  # 10: Job ID: 60, Run At: 2026-06-03 17:45:42 UTC, Enqueued At: 2025-06-03 17:45:42 UTC, Time Diff: 11 months, 4 weeks, 2 days, 4 hours, 39 minutes, and 53.999819073826075 seconds
  task delayed_jobs_list: :environment do
    current_que_jobs = QueJob.where(expired_at: nil).where(finished_at: nil).select(:id, :run_at, :args).to_a

    filtered_and_processed_jobs = []

    current_que_jobs.each do |job|
      run_at_time = job.run_at
      enqueued_at_time = nil

      if job.args.is_a?(Hash) && job.args.key?('enqueued_at')
        begin
          enqueued_at_time = Time.parse(job.args['enqueued_at'])
        rescue ArgumentError
          next
        end
      end

      if run_at_time.present? && enqueued_at_time.present?
        time_diff_seconds = run_at_time - enqueued_at_time

        if time_diff_seconds > 1.month.to_i
          filtered_and_processed_jobs << {
            id: job.id,
            run_at: run_at_time,
            enqueued_at: enqueued_at_time,
            time_diff_seconds: time_diff_seconds,
            time_diff_readable: ActiveSupport::Duration.build(time_diff_seconds).inspect
          }
        end
      end
    end

    sorted_jobs = filtered_and_processed_jobs.sort_by { |job_data| job_data[:time_diff_seconds] }

    puts "\n--- que_jobs with `run_at` > 1 Month after `enqueued_at` (Sorted by Delay) ---"
    if sorted_jobs.empty?
      puts 'No jobs found with a delay greater than 1 month.'
    else
      sorted_jobs.each_with_index do |job_data, index|
        puts "#{index + 1}: Job ID: #{job_data[:id]}, Run At: #{job_data[:run_at]}, Enqueued At: #{job_data[:enqueued_at]}, Time Diff: #{job_data[:time_diff_readable]}"
      end
    end
    puts
  end
end
