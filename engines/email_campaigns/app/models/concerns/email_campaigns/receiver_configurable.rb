module EmailCampaigns
  module ReceiverConfigurable
    extend ActiveSupport::Concern


    included do
      add_recipient_filter :filter_users_in_groups

      has_many :campaigns_groups, dependent: :destroy
      has_many :groups, through: :campaigns_groups
    end


    def filter_users_in_groups users_scope
      users_scope
        .where(id: groups.map(&:members).inject(:+).uniq)
    end

  end
end