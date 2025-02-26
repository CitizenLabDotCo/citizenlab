# frozen_string_literal: true

module Survey
  class ResultsWithGroupGenerator < ResultsGenerator

    private

    def group_field
      @group_field ||= if group_field_id
                         if group_mode == 'user_field'
                           CustomField.find(group_field_id)
                         else
                           find_question(group_field_id)
                         end
                       else
                         false
                       end
    end
  end
end