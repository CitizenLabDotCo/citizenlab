module EmailCampaigns
  class Campaigns::AdminDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable

    recipient_filter :user_filter_admin_only

    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2018)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def consentable_roles
      ['admin']
    end

    def generate_command recipient:, time: nil
      last_delivery = last_delivery_for_recipient(recipient)
      {
        event_payload: {},
        tracked_content: {}
      }
    end


    private

    def user_filter_admin_only users_scope, options={}
      users_scope.admin
    end

  end
end