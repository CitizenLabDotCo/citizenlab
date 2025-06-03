# Tasks to investigate and remove a large set of que_jobs records that were 
# created (enqueued) in March and April 2024, but given `run_at` dates
# far into the future, such that they will be variously executed from now
# until 2032! In many cases, this can result in people receiving extremely
# outdated emails, in turn resulting in a number of customer complaints.

namespace :single_use do
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

    puts "\n--- Distinct QueJob Classes and Their Counts ---"

    if job_class_counts.empty?
      puts "No QueJob records found."
    else
      puts "Found #{found} current QueJob records with run_at dates more than 1 month after their enqueued_at date."
      puts "From a total of #{current_que_jobs.count} current QueJob records. [not expired, not finished]"
      job_class_counts.sort_by { |_name, count| count }.reverse.each do |name, count|
        puts "#{count}: #{name.inspect}"
      end
    end

    puts
  end
end

