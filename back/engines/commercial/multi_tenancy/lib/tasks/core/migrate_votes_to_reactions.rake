# frozen_string_literal: true

# NOTE: Only to be used for release that migrates Votes -> Reactions
namespace :fix_existing_tenants do
  desc 'Migrate all data relating to votes to reactions'
  task migrate_votes_to_reactions: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        migrator = VotesToReactionMigrator.new(tenant)
        migrator.update_downvoting_feature_flag
        migrator.update_initiatives_voting_threshold
        migrator.update_smart_groups
      end
    end
  end

  task migrate_votes_activities: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        migrator = VotesToReactionMigrator.new(tenant)
        migrator.update_activities
      end
    end
  end
end

class VotesToReactionMigrator
  def initialize(tenant)
    @tenant = tenant
  end

  def update_downvoting_feature_flag
    Rails.logger.info("SETTING: Disliking feature flag for #{@tenant.host}")
    settings = AppConfiguration.instance.settings
    settings['disable_disliking'] = settings['disable_downvoting']
    AppConfiguration.instance.update! settings: settings
  end

  def update_initiatives_voting_threshold
    Rails.logger.info("SETTING: initiatives->reacting_threshold for #{@tenant.host}")
    settings = AppConfiguration.instance.settings
    settings['initiatives']['reacting_threshold'] = settings['initiatives']['voting_threshold']
    AppConfiguration.instance.update! settings: settings
    Rails.logger.info("SAVED: initiatives->reacting_threshold for #{@tenant.host}")
  end

  def update_smart_groups
    Rails.logger.info("UPDATING: Smart groups for #{@tenant.host}")

    count = 0
    Group.where(membership_type: 'rules').each do |group|
      next unless group.rules.to_s.include? 'voted'

      group.rules.each do |rule|
        rule['predicate'].sub!('voted', 'reacted')
      end
      group.save!
      count += 1
    end
    Rails.logger.info("SAVED: #{count} groups")
  end

  def update_notifications
    Rails.logger.info("UPDATING: Activities for #{@tenant.host}")
    # TODO: What do we need to do with notifications?
  end

  # Done as separate rake task - this is a large update and less important
  def update_activities
    Rails.logger.info("UPDATING: Activities for #{@tenant.host}")

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
      activity.save!
      count += 1
    end
    Rails.logger.info("SAVED: #{count} 'Vote' activities")

    count = 0
    Activity.where('item_type like ?', '%Voted%').each do |activity|
      activity.item_type = 'Reaction'.sub!('Voted', 'Reacted')
      activity.save!
      count += 1
    end
    Rails.logger.info("SAVED: #{count} 'Notifications::' & 'EmailCampaigns::'  activities")
  end

end
