class ImageAssignmentJob < ApplicationJob
  self.priority = 80

  def run(model, image_assignments)
    image_assignments.each do |field_name, field_value|
      model.send "#{field_name}=", field_value
    end
    model.save!
  end
end
