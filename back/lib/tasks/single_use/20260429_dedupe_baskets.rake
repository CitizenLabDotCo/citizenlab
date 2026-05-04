# frozen_string_literal: true

namespace :single_use do
  desc 'Detach duplicate baskets from their user (sets user_id = NULL) so each user has at most one basket per phase'
  task :dedupe_baskets, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    puts "---------- STARTING TASK: Dedupe baskets ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new
    changes = []

    Tenant.safe_switch_each do |tenant|
      reporter.add_processed_tenant(tenant)

      # One fetch query: every basket that belongs to a (user_id, phase_id) duplicate set.
      dup_pairs_sql = Basket.where.not(user_id: nil)
        .group(:user_id, :phase_id)
        .having('COUNT(*) > 1')
        .select(:user_id, :phase_id)
        .to_sql

      all_dup_baskets = Basket
        .joins("INNER JOIN (#{dup_pairs_sql}) dup ON baskets.user_id = dup.user_id AND baskets.phase_id = dup.phase_id")
        .order(:user_id, :phase_id, :created_at)
        .to_a

      next if all_dup_baskets.empty?

      grouped = all_dup_baskets.group_by { |b| [b.user_id, b.phase_id] }

      puts "Processing tenant: #{tenant.host} - #{grouped.size} duplicate set(s)"

      tenant_changes = []
      grouped.each do |(user_id, phase_id), baskets|
        submitted_baskets = baskets.select(&:submitted?)

        # Selection policy:
        # - 1 submitted, rest drafts -> keep the submitted one
        # - >1 submitted             -> keep the EARLIEST submission
        # - all drafts               -> keep the most-recently-updated draft
        kept_basket =
          if submitted_baskets.size == 1
            submitted_baskets.first
          elsif submitted_baskets.size > 1
            submitted_baskets.min_by(&:submitted_at)
          else
            baskets.max_by(&:updated_at)
          end

        user_phase_baskets_before = []
        user_phase_baskets_after = []

        baskets.each do |basket|
          snapshot = basket.attributes.symbolize_keys
          user_phase_baskets_before << snapshot

          if basket.id == kept_basket.id
            user_phase_baskets_after << snapshot
            next
          end

          next unless execute
          next if basket.update(user_id: nil)

          reporter.add_error(
            basket.errors.details,
            context: { tenant: tenant.host, basket_id: basket.id }
          )
          puts "ERROR! Failed to detach basket #{basket.id}: #{basket.errors.full_messages.join(', ')}"
          user_phase_baskets_after << snapshot # still attached because the update failed
        end

        tenant_changes << { user_id: user_id, phase_id: phase_id, old: user_phase_baskets_before, new: user_phase_baskets_after }

        reporter.add_change(
          user_phase_baskets_before,
          user_phase_baskets_after,
          context: { tenant: tenant.host, user_id: user_id, phase_id: phase_id }
        )
      end
      changes << { tenant: tenant.host, changes: tenant_changes }
    end

    # After all changes have been applied, print a summary of what should have happened
    puts "\nSummary of changes:"
    branch = '|-- '
    corner = '`-- '
    vertical = '|   '
    blank = '    '
    total_duplicates = 0
    total_detached = 0
    changes.each do |change|
      puts "Tenant: #{change[:tenant]} (#{change[:changes].size} duplicate set(s))"

      tenant_duplicates = 0
      tenant_detached = 0

      change[:changes].each_with_index do |dup_set, set_idx|
        last_set = set_idx == change[:changes].size - 1
        set_branch = last_set ? corner : branch
        set_indent = last_set ? blank : vertical

        puts "#{set_branch}user=#{dup_set[:user_id]} phase=#{dup_set[:phase_id]} (#{dup_set[:old].size} baskets)"

        new_ids = dup_set[:new].map { |b| b[:id] }
        dup_set[:old].each_with_index do |b, b_idx|
          last_basket = b_idx == dup_set[:old].size - 1
          basket_branch = last_basket ? corner : branch

          marker = new_ids.include?(b[:id]) ? '[kept]    ' : '[detached]'
          timing = b[:submitted_at] ? "submitted at #{b[:submitted_at].strftime('%Y-%m-%d %H:%M:%S')}" : "draft (updated #{b[:updated_at].strftime('%Y-%m-%d %H:%M:%S')})"

          puts "#{set_indent}#{basket_branch}#{marker} #{b[:id]}  #{timing}"
        end

        tenant_duplicates += dup_set[:old].size
        tenant_detached += dup_set[:old].size - dup_set[:new].size
      end

      puts "Stats: #{tenant_duplicates} basket(s) in duplicate sets, #{tenant_detached} detached"
      total_duplicates += tenant_duplicates
      total_detached += tenant_detached
      puts
    end

    puts "Total across #{changes.size} tenant(s): #{total_duplicates} basket(s) in duplicate sets, #{total_detached} detached \n"

    reporter.report!('dedupe_baskets.json', verbose: false)

    puts "\n---------- FINISHED TASK: Dedupe baskets ----------\n\n"
  end
end
