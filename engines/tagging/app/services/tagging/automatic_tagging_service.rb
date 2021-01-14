module Tagging
  class AutomaticTaggingService
    def save_tags_from_prediction(body)
      if body['status'] == 'SUCCESS'
        switch_tenant(body) do
          prediction = body['result']['data']['final_predictions']
          parse_prediction prediction do |tag_id, document_id, confidence_score|
            create_tag tag_id, document_id, confidence_score
          end
          Tagging.pending.where(idea_id: prediction&.map { |document| document['id'] })&.delete_all
          TagService.new.remove_unused_tags unless processing?
        end
      end
    end

    def cancel_tasks
      Tagging.pending.destroy_all
      if Tagging.pending&.map { |e| e.task_id }.uniq.map do |task_id|
           NLP::TasksService.new.cancel(task_id)
           # for now we'll be very optimistic and just act as if cancelling always work.
           # Tagging.pending.where(task_id: task_id).destroy_all if r== 200
         end.all? do |r|
           r == 200
         end
        TagService.new.remove_unused_tags
        200
      else
        500
      end
    end

    def processing?
      !Tagging.pending.empty?
    end

    private

    def switch_tenant(body)
      tenant_id = body['result']['data']['tenant_id']
      if tenant_id
        Apartment::Tenant.switch(Tenant.find(tenant_id).schema_name) do
          yield
        end
      else
        yield
      end
    end

    def parse_prediction(suggestion)
      suggestion&.each do |document|
        document['predicted_labels'].each do |label|
          yield label['id'], document['id'], label['confidence']
        end
      end
    end

    def create_tag(tag_id, document_id, confidence_score)
      Tagging.create(
        tag_id: tag_id,
        idea_id: document_id,
        assignment_method: :automatic,
        confidence_score: confidence_score
      )
    end
  end
end
