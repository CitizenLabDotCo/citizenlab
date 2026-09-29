# frozen_string_literal: true

class SideFxFileService
  include SideFxHelper

  def after_destroy(file)
    return unless file.respond_to?(:idea) && file.idea

    destroy_file_answers(file)
  end

  private

  def destroy_file_answers(file)
    CustomFieldAnswer.where(answerable: file.idea).where("value->>'id' = ?", file.id).delete_all
  end
end
