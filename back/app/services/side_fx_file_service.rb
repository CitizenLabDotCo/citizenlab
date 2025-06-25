# frozen_string_literal: true

class SideFxFileService
  include SideFxHelper

  def after_destroy(file)
    return unless file.respond_to?(:idea) && file.idea

    idea = file.idea

    keys_to_delete = idea.custom_field_values.select do |_key, value|
      value.is_a?(Hash) && value['id'] == file.id
    end.keys

    keys_to_delete.each { |key| idea.custom_field_values.delete(key) }

    idea.save! if keys_to_delete.any?
  end
end
