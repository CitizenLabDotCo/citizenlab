# frozen_string_literal: true

namespace :single_use do
  desc "Set users' first_name and/or last_name to nil when they contain an '@' (likely an email stored as a name)"
  task :nullify_email_like_user_names, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    puts "---------- STARTING TASK: Nullify email-like user names ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      reporter.add_processed_tenant(tenant)

      users = User.where("first_name LIKE '%@%' OR last_name LIKE '%@%'").to_a
      next if users.empty?

      puts "Processing tenant: #{tenant.host} - #{users.size} affected user(s)"

      users.each do |user|
        before = user.attributes.symbolize_keys

        user.first_name = nil if user.first_name.to_s.include?('@')
        user.last_name  = nil if user.last_name.to_s.include?('@')
        next unless user.changed?

        if execute
          begin
            user.save!
          rescue StandardError => e
            reporter.add_error(e.message, context: { tenant: tenant.host, user_id: user.id })
            puts "ERROR! Failed to update user #{user.id}: #{e.message}"
            user.reload
            next
          end
          after = user.reload.attributes.symbolize_keys
        else
          after = user.attributes.symbolize_keys
        end

        reporter.add_change(before, after, context: { tenant: tenant.host, user_id: user.id })
      end
    rescue StandardError => e
      reporter.add_error(e.message, context: { tenant: tenant.host })
      puts "ERROR! Failed to process tenant #{tenant.host}: #{e.message}"
    end

    begin
      NullifyEmailLikeUserNamesSummaryPrinter.print_summary(reporter)
    rescue StandardError => e
      puts "ERROR! Failed to print summary: #{e.message}"
    ensure
      reporter.report!('nullify_email_like_user_names.json', verbose: false)
    end

    puts "\n---------- FINISHED TASK: Nullify email-like user names ----------\n\n"
  end
end

class NullifyEmailLikeUserNamesSummaryPrinter
  BRANCH = '|-- '
  CORNER = '`-- '

  def self.print_summary(reporter)
    puts "\nSummary of changes:"
    total_first = 0
    total_last  = 0
    changes_by_tenant = reporter.changes.group_by { |c| c[:context][:tenant] }

    changes_by_tenant.each do |tenant_host, changes|
      first_cleared = changes.count { |c| !c[:old_value][:first_name].nil? && c[:new_value][:first_name].nil? }
      last_cleared  = changes.count { |c| !c[:old_value][:last_name].nil?  && c[:new_value][:last_name].nil? }

      puts "Tenant: #{tenant_host} (#{changes.size} user(s))"
      changes.each_with_index do |change, idx|
        last_row = idx == changes.size - 1
        branch = last_row ? CORNER : BRANCH
        puts "#{branch}user=#{change[:context][:user_id]} email=#{change[:old_value][:email]} " \
             "first_name=#{change[:old_value][:first_name].inspect}->#{change[:new_value][:first_name].inspect} " \
             "last_name=#{change[:old_value][:last_name].inspect}->#{change[:new_value][:last_name].inspect}"
      end
      puts "Stats: #{first_cleared} first_name(s) cleared, #{last_cleared} last_name(s) cleared"
      puts

      total_first += first_cleared
      total_last  += last_cleared
    end

    puts "Total across #{changes_by_tenant.size} tenant(s): #{total_first} first_name(s) cleared, #{total_last} last_name(s) cleared\n"
  end
end
