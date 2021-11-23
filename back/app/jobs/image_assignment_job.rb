class ImageAssignmentJob < ApplicationJob
  include SideFxHelper
  queue_as :image_creation

  def run model, image_assignments
    image_assignments.each do |field_name, field_value|
      model.send("#{field_name}=", field_value)
    end
    model.save!
  end

end

# 1. Create a sync service out of this job
# 1.1 Check what SideFxHelper does here
# 2. Add retries + Sentry tracking to task :verify (talk to Philip)
# 3. Add tests
