require "rails_helper"

describe TimelineService do
  let(:service) { ParticipantsService.new }

  describe "participants" do

    it "returns participants across the whole platform at any time" do
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      travel_to Time.now - 100.days do
        create(:idea_published_activity, user: pp1)
      end
      travel_to Time.now - 6.days do
        create(:activity, item: create(:comment), action: 'created', user: pp2)
      end
      travel_to Time.now - 2.days do
        create(:activity, item: create(:comment), action: 'changed', user: pp3)
      end
      create(:activity, item: create(:comment), action: 'created', user: pp4)

      expect(service.participants().map(&:id)).to match participants.map(&:id)
    end

    it "returns participants across the whole platform since a given date" do
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      travel_to Time.now - 100.days do
        create(:idea_published_activity, user: pp1)
      end
      travel_to Time.now - 6.days do
        create(:activity, item: create(:comment), action: 'created', user: pp2)
      end
      travel_to Time.now - 2.days do
        create(:activity, item: create(:comment), action: 'changed', user: pp3)
      end
      create(:activity, item: create(:comment), action: 'created', user: pp4)

      expect(service.participants(since: (Time.now-6.days)).map(&:id)).to match [pp2.id,pp3.id,pp4.id]
    end

    it "returns participants of a given project at any time" do
      project = create(:project)
      other_project = create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      idea = nil
      other_idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, idea: idea, author: pp2)
        other_idea = create(:idea, project: other_project, author: others.first)
      end
      travel_to Time.now - 2.days do
        create(:vote, votable: idea, mode: 'up', user: pp3)
        create(:comment, idea: idea, author: pp2)
        create(:comment, idea: other_idea, author: others.last)
      end
      create(:comment, idea: idea, author: pp4)

      expect(service.participants(project: project).map(&:id)).to match participants.map(&:id)
    end

    it "returns participants of a given project since a given date" do
      project = create(:project)
      other_project = create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      idea = nil
      other_idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, idea: idea, author: pp2)
        create(:idea, project: project, author: others.first)
      end
      travel_to Time.now - 2.days do
        create(:vote, votable: idea, mode: 'up', user: pp3)
        create(:comment, idea: idea, author: pp2)
        create(:comment, idea: other_idea, author: others.last)
      end
      create(:comment, idea: idea, author: pp4)

      expect(service.participants(project: project, since: (Time.now-5.days)).map(&:id)).to match [pp2.id, pp3.id, pp4.id]
    end

  end

end
