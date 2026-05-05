# frozen_string_literal: true

namespace :single_use do
  desc 'Detach duplicate baskets from their user (sets user_id = NULL) so each user has at most one basket per phase'
  task :dedupe_baskets, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    puts "---------- STARTING TASK: Dedupe baskets ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

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
          user_phase_baskets_before << basket.attributes.symbolize_keys

          if basket.id == kept_basket.id
            user_phase_baskets_after << basket.attributes.symbolize_keys
            next
          end

          if execute
            begin
              basket.update!(user_id: nil)
            rescue StandardError => e
              reporter.add_error(e.message, context: { tenant: tenant.host, basket_id: basket.id })
              puts "ERROR! Failed to detach basket #{basket.id}: #{e.message}"
              basket.reload # update! assigns in-memory before validating; reload to reflect actual DB state
            end
            user_phase_baskets_after << basket.attributes.symbolize_keys
            next
          end

          # Dry run: simulate the detach
          user_phase_baskets_after << basket.attributes.symbolize_keys.merge(user_id: nil)
        end

        reporter.add_change(
          user_phase_baskets_before,
          user_phase_baskets_after,
          context: { tenant: tenant.host, user_id: user_id, phase_id: phase_id }
        )
      end
    end

    # After all changes have been applied, print a summary of what should have happened
    puts "\nSummary of changes:"
    branch = '|-- '
    corner = '`-- '
    vertical = '|   '
    blank = '    '
    total_duplicates = 0
    total_detached = 0
    changes_by_tenant = reporter.changes.group_by { |c| c[:context][:tenant] }
    changes_by_tenant.each do |tenant_host, dup_sets|
      puts "Tenant: #{tenant_host} (#{dup_sets.size} duplicate set(s))"

      tenant_duplicates = 0
      tenant_detached = 0

      dup_sets.each_with_index do |dup_set, set_idx|
        last_set = set_idx == dup_sets.size - 1
        set_branch = last_set ? corner : branch
        set_indent = last_set ? blank : vertical

        puts "#{set_branch}user=#{dup_set[:context][:user_id]} phase=#{dup_set[:context][:phase_id]} (#{dup_set[:old_value].size} baskets)"

        new_by_id = dup_set[:new_value].index_by { |b| b[:id] }
        dup_set[:old_value].each_with_index do |b, b_idx|
          last_basket = b_idx == dup_set[:old_value].size - 1
          basket_branch = last_basket ? corner : branch

          new_b = new_by_id[b[:id]]
          detached = new_b && !b[:user_id].nil? && new_b[:user_id].nil?
          marker = detached ? '[detached]' : '[kept]    '
          timing = b[:submitted_at] ? "submitted at #{b[:submitted_at].strftime('%Y-%m-%d %H:%M:%S')}" : "draft (updated #{b[:updated_at].strftime('%Y-%m-%d %H:%M:%S')})"

          puts "#{set_indent}#{basket_branch}#{marker} #{b[:id]}  #{timing}"
        end

        tenant_duplicates += dup_set[:old_value].size
        tenant_detached += dup_set[:new_value].count { |b| b[:user_id].nil? }
      end

      puts "Stats: #{tenant_duplicates} basket(s) in duplicate sets, #{tenant_detached} detached"
      total_duplicates += tenant_duplicates
      total_detached += tenant_detached
      puts
    end

    puts "Total across #{changes_by_tenant.size} tenant(s): #{total_duplicates} basket(s) in duplicate sets, #{total_detached} detached \n"

    reporter.report!('dedupe_baskets.json', verbose: false)

    puts "\n---------- FINISHED TASK: Dedupe baskets ----------\n\n"
  end
end
