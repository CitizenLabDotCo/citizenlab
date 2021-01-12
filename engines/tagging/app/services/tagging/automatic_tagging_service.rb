module Tagging
  class AutomaticTaggingService
    def add_tags(body)
      switch_tenant(body) do
        save_tagging body["result"]["data"]["final_predictions"] if body["status"] == 'SUCCESS'
      end
    end

    def cancel_tasks
      if Tagging.pending&.map { |e| e.task_id }.uniq.map { |task_id|
          r = NLP::TasksService.new.cancel(task_id)
          # for now we'll be very optimistic and just act as if cancelling always work.
          # Tagging.pending.where(task_id: task_id).destroy_all if r== 200
          r
        }.all? { |r|
          r == 200
        }
        Tagging.pending.destroy_all
        TagService.new.remove_unused_tags
        200
      else
        Tagging.pending.destroy_all
        500
      end
    end

    def processing?
      Tagging.pending.length > 0
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

      p '/n'
      p '/n'
      p '/n'
      p '/n'
      p '/n'
      p '/n'
      p 'processing?'
      p processing?
      p '/n'
      p '/n'
      p '/n'

      TagService.new.remove_unused_tags unless processing?
    end
  end
end
