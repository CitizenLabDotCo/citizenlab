module EmailCampaigns::GroupDecorator
  extend ActiveSupport::Concern

  included do
    has_many :campaigns_groups, class_name: 'EmailCampaigns::CampaignsGroup', dependent: :destroy
    has_many :campaigns, class_name: 'EmailCampaigns::Campaign', through: :campaigns_groups
  end

end