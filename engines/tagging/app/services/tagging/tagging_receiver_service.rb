module Tagging
  class TaggingReceiverService
    def add_tags(body)
      switch_tenant(body) do
        save_tagging body["result"]["data"]["final_predictions"] if body["status"] == 'SUCCESS'
      end
    end


    private

    def switch_tenant body
      tenant_id = body["result"]["data"]["tenant_id"]
      if tenant_id
        Apartment::Tenant.switch(Tenant.find(tenant_id).schema_name) do
          yield
        end
      else
        yield
      end
    end

    def save_tagging(suggestion)
      suggestion&.each do |document|
        Tagging.pending.find_by(idea_id: document["id"])&.delete


        document["predicted_labels"].each do |label|
          Tagging.create(
            tag_id: label["id"],
            idea_id: document["id"],
            assignment_method: :automatic,
            confidence_score: label["confidence"]
          )
        end
      end
    end
  end
end
