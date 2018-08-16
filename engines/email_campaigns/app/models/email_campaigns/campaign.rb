module EmailCampaigns
  class Campaign < ApplicationRecord

    belongs_to :author, class_name: 'User', optional: true

    def self.add_send_filter action_symbol
      @send_filters ||= []
      @send_filters << action_symbol
    end

    def self.send_filters
      @send_filters
    end

    def self.add_recipient_filter action_symbol
      @recipient_filters ||= []
      @recipient_filters << action_symbol
    end

    def self.recipient_filters
      @recipient_filters
    end

    def apply_send_filters activity: nil, time: nil
      self.class.send_filters.all? do |action_symbol|
        self.send(action_symbol, {activity: activity, time: time})
      end
    end

    def apply_recipient_filters activity: nil, time: nil
      self.class.recipient_filters.inject(User.all) do |users_scope, action_symbol|
        self.send(action_symbol, users_scope, {activity: activity, time: time})
      end
    end

    protected

    def serialize_campaign item
      serializer = "EmailCampaigns::#{self.class.name}CommandSerializer".constantize
      ActiveModelSerializers::SerializableResource.new(object, {
        serializer: serializer,
        adapter: :json
        }).serializable_hash
    end
  end
end