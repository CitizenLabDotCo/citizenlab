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

  describe "build_structure" do
    it "successfully builds cluster structures by project level" do
      p1, p2 = create_list(:project,2)
      i1 = create(:idea, project: p1)
      i2 = create(:idea, project: p1)
      i3 = create(:idea, project: p2)
      
      expect(order_children_rec(service.build_structure(['project'])[:children])).to match(order_children_rec([
        {
          type: "project",
          id: p1.id,
          children: [
            {
              type: "idea",
              id: i1.id
            },
            {
              type: "idea",
              id: i2.id
            }
          ]
        },
        {
          type: "project",
          id: p2.id,
          children: [
            {
              type: "idea",
              id: i3.id
            }
          ]
        }
      ]))
    end

    it "successfully builds cluster structures by topic level" do
      t1, t2 = create_list(:topic, 2)
      i1 = create(:idea, topics: [t1])
      i2 = create(:idea, topics: [t2])
      i3 = create(:idea, topics: [t2])
      
      expect(order_children_rec(service.build_structure(['topic'])[:children])).to match(order_children_rec([
        {
          type: "topic",
          id: t1.id,
          children: [
            {
              type: "idea",
              id: i1.id
            }
          ]
        },
        {
          type: "topic",
          id: t2.id,
          children: [
            {
              type: "idea",
              id: i2.id
            },
            {
              type: "idea",
              id: i3.id
            }
          ]
        }
      ]))
    end

    it "successfully builds cluster structures by area level" do
      a1, a2 = create_list(:area, 2)
      i1 = create(:idea, areas: [a1])
      i2 = create(:idea, areas: [a2])
      i3 = create(:idea, areas: [a2])
      
      expect(order_children_rec(service.build_structure(['area'])[:children])).to match(order_children_rec([
        {
          type: "area",
          id: a1.id,
          children: [
            {
              type: "idea",
              id: i1.id
            }
          ]
        },
        {
          type: "area",
          id: a2.id,
          children: [
            {
              type: "idea",
              id: i2.id
            },
            {
              type: "idea",
              id: i3.id
            }
          ]
        }
      ]))
    end

    it "successfully builds cluster structures for 2 or more levels" do
      p1, p2 = create_list(:project,2)
      t1, t2 = create_list(:topic, 2)
      i1 = create(:idea, project: p1, topics: [t1])
      i2 = create(:idea, project: p1, topics: [t1])
      i3 = create(:idea, project: p2, topics: [t1])
      i4 = create(:idea, project: p2, topics: [t2])
      
      expect(order_children_rec(service.build_structure(['project', 'topic'])[:children])).to match(order_children_rec([
        {
          type: "project",
          id: p1.id,
          children: [
            {
              type: "topic",
              id: t1.id,
              children: [
                {
                  type: "idea",
                  id: i1.id
                },
                {
                  type: "idea",
                  id: i2.id
                }
              ]
            }
          ]
        },
        {
          type: "project",
          id: p2.id,
          children: [
            {
              type: "topic",
              id: t1.id,
              children: [
                {
                  type: "idea",
                  id: i3.id
                }
              ]
            },
            {
              type: "topic",
              id: t2.id,
              children: [
                {
                  type: "idea",
                  id: i4.id
                }
              ]
            }
          ]
        }
      ]))
    end
  end

  def order_children_rec children # because match_unordered_json from rspec-json_expectations doesn't work :(
    children.each do |struc|
      if struc[:children]
        struc[:children] = order_children_rec struc[:children]
      end
    end
    children.sort_by{|child| child[:id]}
  end

end
