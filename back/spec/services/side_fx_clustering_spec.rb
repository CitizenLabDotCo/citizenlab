require "rails_helper"

describe SideFxClusteringService do
  let(:service) { SideFxClusteringService.new }
  let(:user) { create(:user) }
  let(:clustering) { create(:clustering) }

  describe "after_create" do
    it "logs a 'created' action when a clustering is created" do
      expect {service.after_create(clustering, user)}.
        to have_enqueued_job(LogActivityJob).with(clustering, 'created', user, clustering.created_at.to_i)
    end
  end

  describe "after_update" do
    it "logs a 'changed' action job when the clustering has changed" do
      clustering.update(title_multiloc: {'en': 'changed'})
      expect {service.after_update(clustering, user)}.
        to have_enqueued_job(LogActivityJob).with(clustering, 'changed', user, clustering.updated_at.to_i)
    end
  end

  describe "after_destroy" do
    it "logs a 'deleted' action job when the clustering is destroyed" do
      travel_to Time.now do
        frozen_area = clustering.destroy
        expect {service.after_destroy(frozen_area, user)}.
          to have_enqueued_job(LogActivityJob)
      end
    end
  end

end
