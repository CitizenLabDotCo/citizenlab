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



    
    # Example usage:
    ### EmailCampaigns::CampaignEmailCommand.restricted_expand_by_content_id(campaign_email_commands=EmailCampaigns::CampaignEmailCommand.where(campaign: 'admin_weekly_report')) do |idea|
    ###   idea.slug.starts_with? 's'
    ### end
    def self.restricted_expand_by_content_id campaign_email_commands=self.all, content_class='Idea'

      campaign_email_commands = self.expand_by_content_id(campaign_email_commands, content_class)
      content_instances = content_class.constantize.find campaign_email_commands.map(&"#{content_class.underscore}_id".to_sym)
      filtered_ids = content_instances.select{|inst| yield inst}.map(&:id)
      campaign_email_commands.select{|cec| filtered_ids.include? cec["#{content_class.underscore}_id".to_sym]}

          # .joins("LEFT JOIN #{content_class.underscore.pluralize} 
          #         ON #{content_class.underscore.pluralize}.id = email_campaigns_campaign_email_commands.#{content_class.underscore}_id")
    end

    # TODO for each cec, take list of ids and do find with array of ids as arg as second querry

    def self.expand_by_content_id campaign_email_commands=self.all, content_class='Idea'
      campaign_email_commands.select(
        "email_campaigns_campaign_email_commands.*, 
         jsonb_array_elements(jsonb_extract_path(tracked_content, '#{content_class.underscore}_ids')) as #{content_class.underscore}_id"
         )
    end



    # def self.join_campaign_email_command
    # 	# TODO kill the posgresql creators

    # 	# self.all.select("email_campaigns_campaign_email_commands.*, jsonb_array_elements(jsonb_extract_path(tracked_content, 'idea_ids')) as idea_id").joins("LEFT JOIN ideas ON ideas.id = idea_id")
    # 	# EmailCampaigns::CampaignEmailCommand.join_campaign_email_command
    # 	self.from("(SELECT  email_campaigns_campaign_email_commands.*, 
    #                       jsonb_array_elements(jsonb_extract_path(tracked_content, 'idea_ids')) AS idea_id 
    #               FROM email_campaigns_campaign_email_commands) AS to_join")
    #       .joins("LEFT OUTER JOIN ideas ON ideas.id = uuid(idea_id::TEXT)")
    # end

    private

    def set_commanded_at
    	self.commanded_at = Time.now
    end

  end
end