User.class_eval do

  has_many :campaigns, class_name: 'EmailCampaigns::Campaign', dependent: :nullify

end