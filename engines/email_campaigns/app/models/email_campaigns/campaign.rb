module EmailCampaigns
  class Campaign < ApplicationRecord

    belongs_to :author, class_name: 'User', optional: true

    @@send_filters = []
    @@recipient_filter = []

    def self.add_send_filter action_symbol
      @@send_filters << action_symbol
    end

    def self.add_recipient_filter action_symbol
      @@recipient_filters << action_symbol
    end

    protected

    def apply_send_filters activity: nil, time: nil
      @@send_filters.all? do |action_symbol|
        self.send(action_symbol, {activity: activity, time: time})
      end
    end

    def apply_recipient_filters activity: nil, time: nil
      @@recipient_filters.each_with_object(User.all) do |action_symbol, users_scope|
        self.send(action_symbol, users_scope, {activity: activity, time: time})
      end
    end

    def serialize_campaign item
      serializer = "EmailCampaigns::#{self.class.name}CommandSerializer".constantize
      ActiveModelSerializers::SerializableResource.new(object, {
        serializer: serializer,
        adapter: :json
        }).serializable_hash
    end
  end
end