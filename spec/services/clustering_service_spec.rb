require "rails_helper"

describe ClusteringService do
  let(:service) { ClusteringService.new }

  describe "drop_empty_clusters" do

    it "leaves non-empty clusters intact" do
      clustering = {
        type: "custom",
        id: "9b2ff55f-a9af-4e0d-91bf-66eb1d41edbd",
        children: [
          {
            type: "idea",
            id: "2e38af20-90af-4204-9bb6-03f8bce8a234"
          },
          {
            type: "idea",
            id: "2e38af20-90af-4204-9bb6-03f8bce8a234"
          }
        ]
      }

      expect(service.send(:drop_empty_clusters, clustering)).to eq clustering
    end

    it "removes non-idea nodes with no children" do
      clustering = {
        type: "custom",
        id: "9b2ff55f-a9af-4e0d-91bf-66eb1d41edbd",
        children: [
          {
            type: "custom",
            id: "2e38af20-90af-4204-9bb6-03f8bce8a234",
            children: [
              type: "custom",
              id: "90707191-781e-4026-83ef-835820f09ef7",
              children: []
            ]
          },
          {
            type: "custom",
            id: "60e889c8-4d13-4a95-b9c4-4e76867404ea",
            children: [
              {
                type: "idea",
                id: "3e844f3d-ad4c-43a5-a733-35a7fc3e78c3"
              },
              {
                type: "custom",
                id: "67b1b7b6-f139-46ec-95ee-607a841a4ac3",
                children: []
              }
            ]
          }
        ]
      }

      expect(service.send(:drop_empty_clusters, clustering)).to eq({
        type: "custom",
        id: "9b2ff55f-a9af-4e0d-91bf-66eb1d41edbd",
        children: [
          {
            type: "custom",
            id: "60e889c8-4d13-4a95-b9c4-4e76867404ea",
            children: [
              {
                type: "idea",
                id: "3e844f3d-ad4c-43a5-a733-35a7fc3e78c3"
              }
            ]
          }
        ]
      })
    end
  end

end
