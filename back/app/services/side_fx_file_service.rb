# frozen_string_literal: true

class SideFxFileService
  include SideFxHelper

  def after_destroy(file)
    return unless file.respond_to?(:idea) && file.idea

    remove_file_refs_from_idea_custom_field_values(file)
  end

  private

  def remove_file_refs_from_idea_custom_field_values(file)
    file.idea.custom_field_answers.each do |answer|
      answer.destroy! if answer.value.is_a?(Hash) && answer.value['id'] == file.id
    end
  end
end
