require "rails_helper"

describe SideFxProjectService do
  let(:sfx_pc) { instance_double(SideFxParticipationContextService) }
  let(:service) { SideFxProjectService.new(sfx_pc) }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe "after_create" do
    it "logs a 'created' action when a project is created" do
      expect {service.after_create(project, user)}.
        to have_enqueued_job(LogActivityJob).with(project, 'created', user, project.created_at.to_i)
    end

    it "calls after_create on SideFxParticipationContextService for a continuous project" do
      continuous_project = create(:continuous_project)
      expect(sfx_pc).to receive(:after_create).with(continuous_project, user)
      service.after_create(continuous_project, user)
    end

    it "doesn't call after_create on SideFxParticipationContextService for a timeline project" do
      service.after_create(project, user)
    end

    it "runs the description through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(project, :description_multiloc).and_return(project.description_multiloc)
      service.after_create(project, user)
    end
  end

  describe "before_update" do
    it "runs the description through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(project, :description_multiloc).and_return(project.description_multiloc)
      service.before_update(project, user)
    end
  end

  describe "after_update" do
    it "logs a 'changed' action job when the project has changed" do
      project.update(title_multiloc: {'en': 'changed'})
      expect {service.after_update(project, user)}.
        to have_enqueued_job(LogActivityJob).with(project, 'changed', user, project.updated_at.to_i)
    end

    it "calls before_update on SideFxParticipationContextService for a continuous project" do
      continuous_project = build(:continuous_project)
      expect(sfx_pc).to receive(:before_update).with(continuous_project, user)
      service.before_update(continuous_project, user)
    end

    it "doesn't call before_update on SideFxParticipationContextService for a timeline project" do
      service.before_update(project, user)
    end
  end

  describe "before_destroy" do
    it "calls before_destroy on SideFxParticipationContextService for a continuous project" do
      continuous_project = build(:continuous_project)
      expect(sfx_pc).to receive(:before_destroy).with(continuous_project, user)
      service.before_destroy(continuous_project, user)
    end

    it "doesn't call before_destroy on SideFxParticipationContextService for a timeline project" do
      service.before_destroy(project, user)
    end

    it "destroys any smart group that refers to this project" do
      group1 = create(:smart_group, rules: [{
        ruleType: 'participated_in_project',
        predicate: 'in',
        value: project.id
      }])
      group2 = create(:smart_group)
      group3 = create(:group)
      service.before_destroy(project, user)
      expect{group1.reload}.to raise_error(ActiveRecord::RecordNotFound)
      expect(Group.count).to eq 2
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
