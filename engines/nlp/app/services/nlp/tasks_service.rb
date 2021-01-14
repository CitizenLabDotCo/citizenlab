module NLP
  class TasksService

    def cancel task_id
      @api ||= NLP::API.new ENV.fetch("CL2_NLP_HOST")
      @api.cancel_task(task_id)
    end

    def status task_id
      @api ||= NLP::API.new ENV.fetch("CL2_NLP_HOST")
      @api.status_task(task_id)
    end


  end
end
