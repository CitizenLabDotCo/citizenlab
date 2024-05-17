# frozen_string_literal: true

class UpdateActivityJob < ApplicationJob
  queue_as :default

  def run(activity, serialized_item, item_name)
    activity = Activity.find_by(id: activity.id)
    return unless activity

    activity.payload[:"#{item_name}"] = serialized_item
    activity.save!
  end
end
