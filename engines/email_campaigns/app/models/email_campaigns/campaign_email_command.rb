module EmailCampaigns
  class CampaignEmailCommand < ApplicationRecord

  	CAMPAIGNS = [
  		'user_platform_digest',
  		'user_activity_on_your_ideas',
  		'user_updates_on_supported_ideas',
  		'user_participation_opportunities',
  		'admin_dayly_activities',
  		'admin_weekly_activity_report'
  	]


    belongs_to :recipient, class_name: 'User'

    validates :campaign, presence: true, inclusion: {in: CAMPAIGNS}

    before_validation :set_commanded_at



    private

    def join_campaign_email_command key
    	42
    end

    def set_commanded_at
    	self.commanded_at == Time.now
    end

  end
end