module EmailCampaigns
  class Campaign
    
    def name
      self.class.name
    end

    private

    def serialize object
      serializer = "EmailCampaigns::Commands::#{self.class.name}CommandSerializer".constantize
      ActiveModelSerializers::SerializableResource.new(object, {
        serializer: serializer,
        adapter: :json
        }).serializable_hash
    end

  end
end