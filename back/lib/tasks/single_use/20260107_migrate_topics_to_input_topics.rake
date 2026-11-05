# frozen_string_literal: true

namespace :topics do
  desc 'Copy existing topics data to new input_topics structure (non-destructive)'
  task migrate_to_input_topics: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      ActiveRecord::Base.transaction do
        # Skip if already migrated (idempotency check)
        if DefaultInputTopic.any? || InputTopic.any?
          puts "  Skipping - migration already run (DefaultInputTopic: #{DefaultInputTopic.count}, InputTopic: #{InputTopic.count})"
          next
        end

        # Step 1: Create default_input_topics from global_topics (copy IDs)
        default_topic_records = GlobalTopic.where(is_default: true).order(:ordering).pluck(
          :id, :title_multiloc, :description_multiloc, :icon, :ordering, :created_at, :updated_at
        ).map.with_index do |(id, title, desc, icon, _ordering, created_at, updated_at), index|
          {
            id: id,
            title_multiloc: title,
            description_multiloc: desc,
            icon: icon,
            ordering: index,
            created_at: created_at,
            updated_at: updated_at
          }
        end

        DefaultInputTopic.insert_all!(default_topic_records) if default_topic_records.any?
        puts "  Created #{default_topic_records.size} default input topics"

        # Step 2: Create input_topics from projects_allowed_input_topics (copy IDs)
        # InputTopic.id = ProjectsAllowedInputTopic.id (1:1 mapping)
        input_topic_records = ProjectsAllowedInputTopic
          .joins('JOIN global_topics ON global_topics.id = projects_allowed_input_topics.topic_id')
          .pluck(
            'projects_allowed_input_topics.id',
            'projects_allowed_input_topics.project_id',
            'global_topics.title_multiloc',
            'global_topics.description_multiloc',
            'global_topics.icon',
            'projects_allowed_input_topics.ordering',
            'projects_allowed_input_topics.created_at',
            'projects_allowed_input_topics.updated_at'
          ).map do |id, project_id, title, desc, icon, ordering, created_at, updated_at|
            {
              id: id,
              project_id: project_id,
              title_multiloc: title,
              description_multiloc: desc,
              icon: icon,
              ordering: ordering || 0,
              created_at: created_at,
              updated_at: updated_at
            }
          end

        InputTopic.insert_all!(input_topic_records) if input_topic_records.any?
        puts "  Created #{input_topic_records.size} input topics"

        # Step 3: Create ideas_input_topics from ideas_topics (copy IDs)
        # IdeasInputTopic.id = IdeasTopic.id (1:1 mapping)
        # input_topic_id found via join (since InputTopic.id = ProjectsAllowedInputTopic.id)
        ideas_input_topic_records = IdeasTopic
          .joins('JOIN ideas ON ideas.id = ideas_topics.idea_id')
          .joins('JOIN projects_allowed_input_topics pait ON pait.project_id = ideas.project_id AND pait.topic_id = ideas_topics.topic_id')
          .pluck(
            'ideas_topics.id',
            'ideas_topics.idea_id',
            'pait.id'
          ).map do |id, idea_id, input_topic_id|
            {
              id: id,
              idea_id: idea_id,
              input_topic_id: input_topic_id
            }
          end

        IdeasInputTopic.insert_all!(ideas_input_topic_records) if ideas_input_topic_records.any?
        puts "  Created #{ideas_input_topic_records.size} ideas_input_topics"

        # Report orphaned records (ideas with topics not allowed in their project)
        orphaned_count = IdeasTopic.count - ideas_input_topic_records.size
        puts "  Warning: #{orphaned_count} orphaned ideas_topics records skipped" if orphaned_count.positive?

        # Step 4: Update activities table (Topic → GlobalTopic)
        activities_count = Activity.where(item_type: 'Topic').update_all(item_type: 'GlobalTopic')
        puts "  Updated #{activities_count} activities (Topic → GlobalTopic)"

        # Step 5: Update smart group rules (GlobalTopic IDs → InputTopic IDs)
        groups_updated = 0
        Group.where(membership_type: 'rules').find_each do |group|
          updated = false
          rules = group.rules.map do |rule|
            next rule unless rule['ruleType'] == 'participated_in_topic'

            global_topic_ids = Array(rule['value'])
            input_topic_ids = ProjectsAllowedInputTopic
              .where(topic_id: global_topic_ids)
              .pluck(:id)

            if input_topic_ids.any?
              updated = true
              rule.merge('value' => input_topic_ids)
            else
              puts "  Warning: No InputTopics found for group #{group.id} rule with topics #{global_topic_ids}"
              rule
            end
          end

          if updated
            group.update_column(:rules, rules)
            groups_updated += 1
          end
        end
        puts "  Updated #{groups_updated} smart group rules"
      end

      puts "Completed tenant: #{tenant.host}"
      puts '---'
      # rescue StandardError => e
      #   puts "  Error processing tenant #{tenant.host}: #{e.message}"
      #   puts e.backtrace.first(5).join("\n")
      #   puts '---'
    end
  end

  desc 'Audit the topics to input_topics migration - verify data integrity'
  task audit_migration: :environment do
    all_passed = true

    Tenant.safe_switch_each do |tenant|
      puts "Auditing tenant: #{tenant.host}"
      tenant_passed = true

      # Check 1: DefaultInputTopic count matches GlobalTopic (is_default: true)
      dit_count = DefaultInputTopic.count
      gt_default_count = GlobalTopic.where(is_default: true).count
      if dit_count == gt_default_count
        puts "  [PASS] DefaultInputTopic count: #{dit_count}"
      else
        puts "  [FAIL] DefaultInputTopic count mismatch: #{dit_count} vs #{gt_default_count} expected"
        tenant_passed = false
      end

      # Check 2: DefaultInputTopic IDs match GlobalTopic IDs
      dit_ids = DefaultInputTopic.pluck(:id).sort
      gt_ids = GlobalTopic.where(is_default: true).pluck(:id).sort
      if dit_ids == gt_ids
        puts '  [PASS] DefaultInputTopic IDs match GlobalTopic IDs'
      else
        missing = gt_ids - dit_ids
        extra = dit_ids - gt_ids
        puts '  [FAIL] DefaultInputTopic IDs mismatch'
        puts "         Missing: #{missing.first(5).join(', ')}#{missing.size > 5 ? '...' : ''}" if missing.any?
        puts "         Extra: #{extra.first(5).join(', ')}#{extra.size > 5 ? '...' : ''}" if extra.any?
        tenant_passed = false
      end

      # Check 3: InputTopic count matches ProjectsAllowedInputTopic
      it_count = InputTopic.count
      pait_count = ProjectsAllowedInputTopic.count
      if it_count == pait_count
        puts "  [PASS] InputTopic count: #{it_count}"
      else
        puts "  [FAIL] InputTopic count mismatch: #{it_count} vs #{pait_count} expected"
        tenant_passed = false
      end

      # Check 4: InputTopic IDs match ProjectsAllowedInputTopic IDs
      it_ids = InputTopic.pluck(:id).sort
      pait_ids = ProjectsAllowedInputTopic.pluck(:id).sort
      if it_ids == pait_ids
        puts '  [PASS] InputTopic IDs match ProjectsAllowedInputTopic IDs'
      else
        missing = pait_ids - it_ids
        extra = it_ids - pait_ids
        puts '  [FAIL] InputTopic IDs mismatch'
        puts "         Missing: #{missing.first(5).join(', ')}#{missing.size > 5 ? '...' : ''}" if missing.any?
        puts "         Extra: #{extra.first(5).join(', ')}#{extra.size > 5 ? '...' : ''}" if extra.any?
        tenant_passed = false
      end

      # Check 5: IdeasInputTopic count vs IdeasTopic (should be <= due to orphans)
      iit_count = IdeasInputTopic.count
      ideas_topic_count = IdeasTopic.count
      orphan_count = ideas_topic_count - iit_count
      if iit_count <= ideas_topic_count
        puts "  [PASS] IdeasInputTopic count: #{iit_count} (#{orphan_count} orphaned IdeasTopic records)"
      else
        puts "  [FAIL] IdeasInputTopic count exceeds IdeasTopic: #{iit_count} vs #{ideas_topic_count}"
        tenant_passed = false
      end

      # Check 6: No activities with item_type = 'Topic' remaining
      topic_activities = Activity.where(item_type: 'Topic').count
      if topic_activities.zero?
        puts "  [PASS] No activities with item_type='Topic'"
      else
        puts "  [FAIL] #{topic_activities} activities still have item_type='Topic'"
        tenant_passed = false
      end

      # Check 7: Verify InputTopic data integrity (title_multiloc matches source)
      sample_input_topics = InputTopic.limit(10)
      data_integrity_issues = []
      sample_input_topics.each do |it|
        pait = ProjectsAllowedInputTopic.find_by(id: it.id)
        next unless pait

        global_topic = pait.topic
        next unless global_topic

        if it.title_multiloc != global_topic.title_multiloc
          data_integrity_issues << it.id
        end
      end
      if data_integrity_issues.empty?
        puts "  [PASS] InputTopic data integrity (sampled #{sample_input_topics.size} records)"
      else
        puts "  [FAIL] InputTopic data mismatch for IDs: #{data_integrity_issues.join(', ')}"
        tenant_passed = false
      end

      # Check 8: Verify IdeasInputTopic references valid InputTopics
      invalid_refs = IdeasInputTopic.where.missing(:input_topic).count
      if invalid_refs.zero?
        puts '  [PASS] All IdeasInputTopic records reference valid InputTopics'
      else
        puts "  [FAIL] #{invalid_refs} IdeasInputTopic records reference non-existent InputTopics"
        tenant_passed = false
      end

      # Summary for tenant
      if tenant_passed
        puts '  === TENANT PASSED ==='
      else
        puts '  === TENANT FAILED ==='
        all_passed = false
      end
      puts '---'
    rescue StandardError => e
      puts "  Error auditing tenant #{tenant.host}: #{e.message}"
      puts e.backtrace.first(5).join("\n")
      all_passed = false
      puts '---'
    end

    # Final summary
    puts ''
    if all_passed
      puts '=== ALL TENANTS PASSED ==='
    else
      puts '=== SOME TENANTS FAILED - REVIEW OUTPUT ABOVE ==='
    end
  end
end
