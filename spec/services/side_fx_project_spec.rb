require "rails_helper"

describe SideFxProjectService do
  let(:service) { SideFxProjectService.new }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe "before_create" do
    it "runs the description through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(project, :description_multiloc)
      service.before_create(project, user)
    end
  end

  describe "after_create" do
    it "logs a 'created' action when a project is created" do
      expect {service.after_create(project, user)}.
        to have_enqueued_job(LogActivityJob).with(project, 'created', user, project.created_at.to_i)
    end
  end

  describe "before_update" do
    it "runs the description through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(project, :description_multiloc)
      service.before_update(project, user)
    end
  end

  describe "after_update" do
    it "logs a 'changed' action job when the project has changed" do
      project.update(title_multiloc: {'en': 'changed'})
      expect {service.after_update(project, user)}.
        to have_enqueued_job(LogActivityJob).with(project, 'changed', user, project.updated_at.to_i)
    end
  end

  describe "after_destroy" do
    it "logs a 'deleted' action job when the project is destroyed" do
      travel_to Time.now do
        frozen_project = project.destroy
        expect {service.after_destroy(frozen_project, user)}.
          to have_enqueued_job(LogActivityJob)
      end
    end
  end

end
