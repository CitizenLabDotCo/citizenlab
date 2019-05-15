class ImageAssignmentJob < ApplicationJob
  include SideFxHelper
  queue_as :image_assignment

  def perform model, image_assignments
    image_assignments.each do |field_name, field_value|
      model.send("#{field_name}=", field_value)
    end
    model.save!
  end

end