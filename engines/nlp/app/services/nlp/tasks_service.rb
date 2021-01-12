module NLP
  class TasksService

    def cancel task_id
      @api ||= NLP::API.new ENV.fetch("CL2_NLP_HOST")

      # todo get some feedback from nlp and propagate to error-handle
      @api.cancel_task(task_id)
    end


  end
end
