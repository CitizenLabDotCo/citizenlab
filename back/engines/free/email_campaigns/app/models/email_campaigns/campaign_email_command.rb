# == Schema Information
#
# Table name: email_campaigns_campaign_email_commands
#
#  id              :uuid             not null, primary key
#  campaign        :string
#  recipient_id    :uuid
#  commanded_at    :datetime
#  tracked_content :jsonb
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_email_campaigns_campaign_email_commands_on_recipient_id  (recipient_id)
#
# Foreign Keys
#
#  fk_rails_...  (recipient_id => users.id)
#
module EmailCampaigns
  class CampaignEmailCommand < ApplicationRecord

  	CAMPAIGNS = %w(
      user_platform_digest 
      admin_weekly_report 
      moderator_digest 
      user_activity_on_your_ideas 
      user_updates_on_supported_ideas 
      user_participation_opportunities
    )


    belongs_to :recipient, class_name: 'User'

    validates :campaign, presence: true, inclusion: {in: CAMPAIGNS}

    before_validation :set_commanded_at



    
    # Example usage:
    ### EmailCampaigns::CampaignEmailCommand.restricted_expand_by_content_id(campaign_email_commands=EmailCampaigns::CampaignEmailCommand.where(campaign: 'admin_weekly_report')) do |idea|
    ###   idea.slug.starts_with? 's'
    ### end
    def self.restricted_expand_by_content_id campaign_email_commands=self.all, content_class='Idea'
      campaign_email_commands = self.expand_by_content_id(campaign_email_commands, content_class)
      content_ids = campaign_email_commands.map(&"#{content_class.underscore}_id".to_sym)
      content_instances = content_class.constantize.find content_ids
      filtered_ids = content_instances.select{|inst| yield inst}.map(&:id)
      campaign_email_commands.select{|cec| filtered_ids.include? cec["#{content_class.underscore}_id".to_sym]}
    end

    def self.expand_by_content_id campaign_email_commands=self.all, content_class='Idea'
      campaign_email_commands.select(
        "email_campaigns_campaign_email_commands.*, 
         jsonb_array_elements(jsonb_extract_path(tracked_content, '#{content_class.underscore}_ids')) as #{content_class.underscore}_id"
      )
    end


    private

    def set_commanded_at
    	self.commanded_at = Time.now
    end

  end
end
