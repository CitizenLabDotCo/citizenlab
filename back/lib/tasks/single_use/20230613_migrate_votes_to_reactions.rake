# frozen_string_literal: true

# NOTE: Only to be used for release that migrates Votes -> Reactions
namespace :single_use do
  desc 'Transform all core data relating to votes into reactions'
  task migrate_votes_core: [:environment] do |_t, _args|
    # In priority order - active first
    tenants = Tenant.creation_finalized.with_lifecycle('active') +
              Tenant.creation_finalized.with_lifecycle('trial') +
              Tenant.creation_finalized.with_lifecycle('demo') +
              Tenant.creation_finalized.with_lifecycle('expired_trial') +
              Tenant.creation_finalized.with_lifecycle('churned') +
              Tenant.creation_finalized.with_lifecycle('not_applicable')
    vote_migrator = VotesToReactionMigrator.new
    tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        vote_migrator.run_core(tenant)
      end
    end
    vote_migrator.output_errors
  end

  desc 'Transform all activity data relating to votes into reactions'
  task migrate_votes_activities: [:environment] do |_t, _args|
    vote_migrator = VotesToReactionMigrator.new
    Tenant.creation_finalized.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        vote_migrator.run_activities(tenant)
      end
    end
    vote_migrator.output_errors
  end
end

class VotesToReactionMigrator
  def initialize
    @errors = {}
  end

  def run_core(tenant)
    @tenant = tenant
    Rails.logger.info "Processing core data for tenant #{@tenant.host}"
    update_downvoting_feature_flag
    update_initiatives_voting_threshold
    update_smart_groups
    update_permissions
    update_notifications
    update_email_campaigns
  end

  def run_activities(tenant)
    @tenant = tenant
    Rails.logger.info "Processing activities for tenant #{@tenant.host}"
    update_activities
  end

  def output_errors
    Rails.logger.info 'COMPLETE'
    errors_count = 0
    @errors.each do |host, errors|
      errors.each do |error|
        Rails.logger.error "ERROR: [#{host}] #{error}"
        errors_count += 1
      end
    end
    Rails.logger.info 'NO ERRORS FOUND' if errors_count == 0
  end

  private

  def update_downvoting_feature_flag
    Rails.logger.info "SETTING: Disliking feature flag for #{@tenant.host}"
    settings = AppConfiguration.instance.settings
    settings['disable_disliking'] = settings['disable_downvoting']
    AppConfiguration.instance.update! settings: settings
  end

  def update_initiatives_voting_threshold
    Rails.logger.info "SETTING: initiatives->reacting_threshold for #{@tenant.host}"
    settings = AppConfiguration.instance.settings
    settings['initiatives']['reacting_threshold'] = settings['initiatives']['voting_threshold']
    AppConfiguration.instance.update! settings: settings
    Rails.logger.info "SAVED: initiatives->reacting_threshold for #{@tenant.host}"
  end

  def update_smart_groups
    Rails.logger.info "UPDATING: Smart groups for #{@tenant.host}"
    count = 0
    Group.where(membership_type: 'rules').each do |group|
      next unless group.rules.to_s.include? 'voted'

      group.rules.each do |rule|
        rule['predicate'].sub!('voted', 'reacted')
      end
      if group.save
        count += 1
      else
        error_handler "SMART_GROUP_ERROR: #{group.errors.errors}"
      end
    end
    Rails.logger.info "SAVED: #{count} groups"
  end

  # update action for voting_idea, voting_initiative etc
  def update_permissions
    Rails.logger.info "UPDATING: Permissions for #{@tenant.host}"
    count = Permission.where('action like ?', 'voting%')
      .update_all("action = regexp_replace(action, 'voting', 'reacting','g')")
    Rails.logger.info "SAVED: #{count} permissions"
  end

  # update type for OfficialFeedbackOnReactedIdea etc
  def update_notifications
    Rails.logger.info "UPDATING: Notifications for #{@tenant.host}"
    count = Notification.where('type like ?', '%Voted%')
      .update_all("type = regexp_replace(type, 'Voted', 'Reacted','g')")
    Rails.logger.info "SAVED: #{count} notifications"
  end

  # update EmailCampaigns::Campaigns::StatusChangeOfVotedIdea etc
  def update_email_campaigns
    Rails.logger.info("UPDATING: Email Campaigns for #{@tenant.host}")
    count = EmailCampaigns::Campaign.where('type like ?', '%Voted%')
      .update_all("type = regexp_replace(type, 'Voted', 'Reacted','g')")
    Rails.logger.info "SAVED: #{count} email campaigns"
  end

  # Done as separate rake task - this is a large update and less important
  def update_activities
    Rails.logger.info "UPDATING: Activities for #{@tenant.host}"

    count = 0
    Activity.where(item_type: 'Vote').each do |activity|
      activity.item_type = 'Reaction'
      activity.action.sub!('upvote', 'like') # matches: idea_upvoted, comment_upvoted, initiative_upvoted, canceled_idea_upvote, canceled_comment_upvote, canceled_initiative_upvote
      activity.action.sub!('downvote', 'dislike') # matches: idea_downvoted, canceled_idea_downvote, canceled_comment_downvote
      activity.payload = activity.payload.deep_transform_keys do |key|
        case key
        when 'vote'
          'reaction'
        when 'votable_id'
          'reactable_id'
        when 'votable_type'
          'reactable_type'
        else
          key
        end
      end
      if activity.save
        count += 1
      else
        error_handler "ACTIVITY_ERROR: #{group.errors.errors}"
      end
    end
    Rails.logger.info "SAVED: #{count} 'Vote' activities"

    count = Activity.where('item_type like ?', '%Voted%')
      .update_all("item_type = regexp_replace(item_type, 'Voted', 'Reacted','g')")
    Rails.logger.info "SAVED: #{count} 'Notifications::' & 'EmailCampaigns::'  activities"
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @errors[@tenant.host] << error
  end
end
