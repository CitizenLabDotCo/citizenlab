# frozen_string_literal: true

# This rake task updates data randomly so that the dashboard charts look more interesting on demo platforms:
#   - ImpactTracking::Session device_type: 60% mobile, 40% desktop_or_other
#   - ImpactTracking::Session referrer: 50% empty, 15% google, 20% facebook, 15% govocal
#   - OfficialFeedback: creates records so 38% of non-native-survey ideas have one
#   - Idea statuses + Activity: updates status for 80% of ideas and creates changed_status activities
#   - User custom_field_values: populates select/multiselect fields and birthyear with random values
#   - EmailCampaigns::Delivery: creates deliveries for sent campaigns (~50 users per campaign)
#     2% failed, 98% delivered, 70% opened, 40% clicked
#
# Usage:
#   rake 'demos:update_dashboard_data[hostname.com]'
#
# Notes:
#   - Only works on demo platforms or localhost
#   - Should not change any dates of the records.

namespace :demos do
  desc 'Update demo platform data to make dashboards appear more interesting'
  task :update_dashboard_data, %i[host] => [:environment] do |_t, args|
    if args[:host].blank?
      puts 'Usage: rake demos:update_dashboard_data[host]'
      puts '  host: tenant hostname (e.g., localhost or demo.example.com)'
      next
    end

    host = args[:host]

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "Tenant not found: #{host}"
      next
    end

    tenant.switch do
      lifecycle_stage = AppConfiguration.instance.settings.dig('core', 'lifecycle_stage')
      unless host == 'localhost' || lifecycle_stage == 'demo'
        puts 'This task can only be run on demo platforms or localhost.'
        next
      end

      UpdateDemoDashboardData.update_device_types
      UpdateDemoDashboardData.update_referrers
      UpdateDemoDashboardData.create_official_feedback
      UpdateDemoDashboardData.create_idea_status_change_activities
      UpdateDemoDashboardData.update_user_custom_field_values
      UpdateDemoDashboardData.create_email_campaign_deliveries

      puts 'Done.'
    end
  end
end

# rubocop:disable Metrics/ModuleLength
module UpdateDemoDashboardData
  module_function

  def update_device_types
    session_ids = ImpactTracking::Session.order('RANDOM()').pluck(:id)
    total = session_ids.size

    if total.zero?
      puts 'No ImpactTracking::Session records found.'
      return
    end

    mobile_count = (total * 0.6).round
    desktop_count = total - mobile_count

    puts "Total sessions: #{total}"
    puts "Setting device_type: #{mobile_count} mobile, #{desktop_count} desktop_or_other"

    ImpactTracking::Session.where(id: session_ids.first(mobile_count)).update_all(device_type: 'mobile')
    ImpactTracking::Session.where(id: session_ids.last(desktop_count)).update_all(device_type: 'desktop_or_other')
  end

  def update_referrers
    session_ids = ImpactTracking::Session.order('RANDOM()').pluck(:id)
    total = session_ids.size

    if total.zero?
      puts 'No ImpactTracking::Session records found.'
      return
    end

    empty_count = (total * 0.5).round
    google_count = (total * 0.15).round
    facebook_count = (total * 0.2).round
    govocal_count = total - empty_count - google_count - facebook_count

    puts "Setting referrer: #{empty_count} empty, #{google_count} google, #{facebook_count} facebook, #{govocal_count} govocal"

    referrer_groups = {
      nil => session_ids[0, empty_count],
      'https://www.google.com' => session_ids[empty_count, google_count],
      'https://www.facebook.com' => session_ids[empty_count + google_count, facebook_count],
      'https://www.govocal.com' => session_ids[empty_count + google_count + facebook_count, govocal_count]
    }

    referrer_groups.each do |referrer, ids|
      ImpactTracking::Session.where(id: ids).update_all(referrer: referrer)
    end
  end

  def non_native_survey_ideas
    native_survey_idea_ids = Idea.joins(:phases).where(phases: { participation_method: 'native_survey' }).select(:id)
    Idea.where.not(id: native_survey_idea_ids)
  end

  def create_official_feedback
    eligible_ideas = non_native_survey_ideas
    ideas_without_feedback = eligible_ideas.where.not(id: OfficialFeedback.select(:idea_id))

    total_eligible = eligible_ideas.count
    target_with_feedback = (total_eligible * 0.38).round
    existing_with_feedback = total_eligible - ideas_without_feedback.count
    to_create = [target_with_feedback - existing_with_feedback, 0].max

    puts "\nNon-native-survey ideas: #{total_eligible}"
    puts "Already have feedback: #{existing_with_feedback}"
    puts "Creating OfficialFeedback for #{to_create} ideas..."

    return unless to_create.positive?

    template = OfficialFeedback.order(:created_at).first
    if template.nil?
      puts 'No existing OfficialFeedback record found to use as template. Skipping.'
      return
    end

    ideas_without_feedback.order('RANDOM()').limit(to_create).each do |idea|
      random_days = rand(1.0..7.0)
      feedback_time = idea.created_at + random_days.days

      OfficialFeedback.create!({
        id: SecureRandom.uuid,
        idea_id: idea.id,
        user_id: template.user_id,
        body_multiloc: template.body_multiloc,
        author_multiloc: template.author_multiloc,
        created_at: feedback_time,
        updated_at: feedback_time
      })
    end

    # Reset counter caches
    OfficialFeedback.counter_culture_fix_counts only: :idea
  end

  def create_idea_status_change_activities
    eligible_ideas = non_native_survey_ideas
    total = eligible_ideas.count
    target_count = (total * 0.8).round

    # Status distribution: 40% viewed, 35% under_consideration, 10% accepted, 10% rejected, 5% implemented
    status_codes = %w[viewed under_consideration accepted rejected implemented]
    statuses = status_codes.filter_map do |code|
      IdeaStatus.find_by(code: code, participation_method: 'ideation')
    end

    if statuses.empty?
      puts "\nNo matching IdeaStatus records found. Skipping."
      return
    end

    status_weights = [0.4, 0.35, 0.1, 0.1, 0.05].first(statuses.size)
    weight_sum = status_weights.sum

    puts "\nUpdating status and creating changed_status Activity for #{target_count} of #{total} ideas..."

    eligible_ideas.order('RANDOM()').limit(target_count).each do |idea|
      status = weighted_random_pick(statuses, status_weights, weight_sum)

      idea.update_column(:idea_status_id, status.id)

      random_days = rand(1.0..7.0)
      activity_time = idea.created_at + random_days.days

      Activity.create!({
        id: SecureRandom.uuid,
        item_type: 'Idea',
        item_id: idea.id,
        action: 'changed_status',
        payload: '{}',
        acted_at: activity_time,
        created_at: activity_time,
        project_id: idea.project_id
      })
    end
  end

  def update_user_custom_field_values
    select_fields = CustomField.where(resource_type: 'User', input_type: %w[select multiselect])
    birthyear_field = CustomField.find_by(resource_type: 'User', key: 'birthyear')

    if select_fields.none? && birthyear_field.nil?
      puts "\nNo User custom fields to update."
      return
    end

    # Prepare weighted pickers for each select/multiselect field
    field_pickers = select_fields.filter_map do |field|
      values = option_values_for(field)
      if values.empty?
        puts "  Skipping '#{field.key}' - no options"
        next
      end
      weights = values.map { rand(1.0..5.0) }
      { field: field, values: values, weights: weights, weight_sum: weights.sum }
    end

    # Prepare weighted picker for birthyear
    birthyear_picker = nil
    if birthyear_field
      years = (1930..2011).to_a
      peak = rand(1960..1990).to_f
      birthyear_weights = years.map { |y| Math.exp(-((y - peak)**2) / (2 * rand(200.0..800.0))) }
      birthyear_picker = { values: years, weights: birthyear_weights, weight_sum: birthyear_weights.sum }
    end

    users = User.all.order('RANDOM()')
    total_users = users.count
    skip_count = (total_users * 0.05 * rand).round # up to 5% skipped
    users_to_update = users.limit(total_users - skip_count)

    field_names = field_pickers.map { |p| p[:field].key }
    field_names << 'birthyear' if birthyear_picker
    puts "\nUpdating user custom_field_values for #{field_names.join(', ')} (#{total_users - skip_count} users)..."

    updated = 0
    users_to_update.find_each do |user|
      new_values = {}

      field_pickers.each do |picker|
        value = weighted_random_pick(picker[:values], picker[:weights], picker[:weight_sum])
        if picker[:field].input_type == 'multiselect'
          value = [value, *picker[:values].sample(rand(0..picker[:values].size - 1))].uniq
        end
        new_values[picker[:field].key] = value
      end

      if birthyear_picker
        new_values['birthyear'] = weighted_random_pick(
          birthyear_picker[:values], birthyear_picker[:weights], birthyear_picker[:weight_sum]
        )
      end

      cfv = (user.custom_field_values || {}).merge(new_values)
      user.update_column(:custom_field_values, cfv)
      updated += 1
    end

    puts "  Updated #{updated} users, skipped #{skip_count}"
  end

  def create_email_campaign_deliveries
    campaigns = EmailCampaigns::Campaign.where('deliveries_count > 0')

    if campaigns.none?
      puts "\nNo sent EmailCampaigns found."
      return
    end

    users = User.order('RANDOM()').limit(50).to_a
    if users.empty?
      puts "\nNo users found for email campaign deliveries."
      return
    end

    puts "\nCreating EmailCampaigns::Delivery records for #{campaigns.count} campaigns (~#{users.size} users each)..."

    created = 0
    campaigns.each do |campaign|
      existing_user_ids = campaign.deliveries.pluck(:user_id).to_set
      eligible_users = users.reject { |u| existing_user_ids.include?(u.id) }

      next if eligible_users.empty?

      total = eligible_users.size
      failed_count = (total * 0.02).round
      clicked_count = (total * 0.40).round
      opened_count = (total * 0.30).round
      delivered_count = total - failed_count - clicked_count - opened_count

      shuffled = eligible_users.shuffle
      status_assignments = Array.new(failed_count, 'failed') +
                           Array.new(delivered_count, 'delivered') +
                           Array.new(opened_count, 'opened') +
                           Array.new(clicked_count, 'clicked')

      shuffled.zip(status_assignments).each do |user, status|
        sent_at = campaign.created_at + rand(0..3600).seconds
        EmailCampaigns::Delivery.create!(
          campaign: campaign,
          user: user,
          delivery_status: status,
          sent_at: sent_at
        )
        created += 1
      end
    end

    # Fix counter caches after bulk creation
    EmailCampaigns::Delivery.counter_culture_fix_counts only: :campaign

    puts "  Created #{created} deliveries across #{campaigns.count} campaigns"
  end

  def option_values_for(field)
    if field.key == 'domicile'
      # Domicile stores Area UUIDs (or 'outside') instead of option keys
      area_ids = Area.joins(:custom_field_option)
        .where(custom_field_options: { custom_field_id: field.id })
        .pluck(:id)
      outside_option = field.options.find_by(other: true)
      area_ids << 'outside' if outside_option
      area_ids
    else
      field.options.order(:ordering).pluck(:key)
    end
  end

  def weighted_random_pick(keys, weights, weight_sum)
    target = rand * weight_sum
    cumulative = 0.0
    keys.each_with_index do |key, i|
      cumulative += weights[i]
      return key if target <= cumulative
    end
    keys.last
  end
end
# rubocop:enable Metrics/ModuleLength
