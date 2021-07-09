# frozen_string_literal: true

module Insights
  class ProcessedFlagsService
    # Sets a processed_flag for all the inputs in the views
    def set_processed(inputs, view_ids)
      processed_flag_attributes = inputs.to_a.product(view_ids) # yields all pairs of input x category
                                  .map { |input, view_id|
                                    {
                                      view_id: view_id,
                                      input_id: input.id,
                                      input_type: input.class.name,
                                      created_at: Time.zone.now,
                                      updated_at: Time.zone.now
                                    }
                                  }
      ProcessedFlag.insert_all(processed_flag_attributes)
    end

    def resets_flags(view)
      ProcessedFlag.where(view: view).destroy_all
    end
  end
end
