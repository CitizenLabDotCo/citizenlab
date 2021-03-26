# frozen_string_literal: true

module Tagging
  class AutomaticTaggingService
    def save_tags_from_prediction(body)
      if body['status'] == 'SUCCESS'
        switch_tenant(body) do
          prediction = body['result']['data']['final_predictions']
          parse_prediction prediction do |tag_id, document_id, confidence_score|
            create_tag tag_id, document_id, confidence_score
          end
          PendingTask.where(nlp_task_id: body['task_id']).destroy_all
          TagService.new.remove_unused_tags unless processing?
        end
      end
    end

    def cancel_tasks
      if PendingTask.all.map do |task|
        cancelling_status = NLP::TasksService.new.cancel(task.nlp_task_id)
        if cancelling_status != 200
          if NLP::TasksService.new.status(task_id)['status'] != 'PENDING'
            PendingTask.where(nlp_task_id: task_id).destroy_all
            200
          else
            500
          end
        else
          task.destroy
          200
        end
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
      PendingTask.count.positive?
    end

    def create_pending_tasks(batches)
      batches.each do |b|
        PendingTask.create(
          tag_ids: b['tags_ids'],
          idea_ids: b['doc_ids'],
          nlp_task_id: b['task_id']
        )
      end
    end

    private

    def switch_tenant(body)
      tenant_id = body['result']['data']['tenant_id']
      if tenant_id
        Tenant.find(tenant_id).switch do
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
