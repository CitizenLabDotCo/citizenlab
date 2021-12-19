module Insights
  class ZeroshotClassificationTasksFinder

    attr_reader :categories, :inputs

    def initialize(categories, inputs: nil)
      @categories = categories
      @inputs = inputs
    end

    def execute
      tasks = tasks_of_categories(categories)
      filter_inputs(tasks)
    end

    def tasks_of_categories(categories)
      Insights::ZeroshotClassificationTask
        .distinct
        .joins(:categories)
        .where('insights_zeroshot_classification_tasks_categories.category_id' => [categories])
    end

    def filter_inputs(tasks)
      return tasks if inputs.nil?

      tasks.joins(:tasks_inputs)
           .where('insights_zeroshot_classification_tasks_inputs.input_id' => [inputs])
    end
  end
end
