module EmailCampaigns
  class CampaignEmailCommand < ApplicationRecord

  	CAMPAIGNS = [
      'user_platform_digest',
      'admin_weekly_report',
      'moderator_digest',
      'user_activity_on_your_ideas',
      'user_updates_on_supported_ideas',
      'user_participation_opportunities'
  	]


    belongs_to :recipient, class_name: 'User'

    validates :campaign, presence: true, inclusion: {in: CAMPAIGNS}

    before_validation :set_commanded_at



    private

    # def self.join_campaign_email_command
    # 	# TODO kill the posgresql creators

    # 	# self.all.select("email_campaigns_campaign_email_commands.*, jsonb_array_elements(jsonb_extract_path(tracked_content, 'idea_ids')) as idea_id").joins("LEFT JOIN ideas ON ideas.id = idea_id")
    # 	# EmailCampaigns::CampaignEmailCommand.join_campaign_email_command
    # 	self.from("(SELECT  email_campaigns_campaign_email_commands.*, 
    #                       jsonb_array_elements(jsonb_extract_path(tracked_content, 'idea_ids')) AS idea_id 
    #               FROM email_campaigns_campaign_email_commands) AS to_join")
    #       .joins("LEFT OUTER JOIN ideas ON ideas.id = uuid(idea_id::TEXT)")
    # end

    def set_commanded_at
    	self.commanded_at = Time.now
    end

  end
end