require "rails_helper"

describe ParticipantsService do
  let(:service) { ParticipantsService.new }

  describe "participants" do

    it "returns participants across the whole platform at any time" do
      participants = create_list(:user, 5)
      pp1, pp2, pp3, pp4, pp5 = participants
      others = create_list(:user, 3)
      
      travel_to Time.now - 100.days do
        create(:published_activity, user: pp1)
      end
      travel_to Time.now - 6.days do
        create(:activity, item: create(:comment), action: 'created', user: pp2)
      end
      travel_to Time.now - 2.days do
        create(:activity, item: create(:comment), action: 'created', user: pp3)
        create(:activity, item: create(:idea), action: 'created', user: others.first)
      end
      create(:activity, item: create(:idea), action: 'published', user: pp4)
      create(:activity, item: create(:poll_response), action: 'created', user: pp5)

      expect(service.participants().map(&:id)).to match_array participants.map(&:id)
    end

    it "returns participants across the whole platform since a given date" do
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      travel_to Time.now - 100.days do
        create(:published_activity, user: pp1)
      end
      travel_to Time.now - 6.days do
        create(:activity, item: create(:comment), action: 'created', user: pp2)
      end
      travel_to Time.now - 2.days do
        create(:activity, item: create(:comment), action: 'created', user: pp3)
      end
      create(:activity, item: create(:comment), action: 'created', user: pp4)

      expect(service.participants(since: (Time.now-6.days)).map(&:id)).to match_array [pp2.id,pp3.id,pp4.id]
    end
  end

  describe "projects_participants" do

    it "returns participants of a given project at any time" do
      project = create(:continuous_budgeting_project)
      other_project = create(:project)
      participants = create_list(:user, 5)
      pp1, pp2, pp3, pp4, pp5 = participants
      others = create_list(:user, 3)
      
      idea = nil
      other_idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, post: idea, author: pp2)
        other_idea = create(:idea, project: other_project, author: others.first)
      end
      travel_to Time.now - 2.days do
        create(:vote, votable: idea, mode: 'up', user: pp3)
        create(:comment, post: idea, author: pp2)
        create(:comment, post: other_idea, author: others.last)
        create(:basket, ideas: [idea], participation_context: project, user: pp5)
      end
      create(:comment, post: idea, author: pp4)

      expect(service.projects_participants([project]).map(&:id)).to match_array participants.map(&:id)
    end

    it "returns participants of a poll" do
      poll = create(:continuous_poll_project)
      responses = create_list(:poll_response, 2, participation_context: poll)
      participants = responses.map(&:user)
      others = create_list(:user, 2) + [create(:poll_response, participation_context: create(:continuous_poll_project)).user]

      expect(service.projects_participants([poll]).map(&:id)).to match_array participants.map(&:id)
    end

    it "returns volunteering participants" do
      project = create(:continuous_volunteering_project)
      cause = create(:cause, participation_context: project)
      volunteers = create_list(:volunteer, 2, cause: cause)
      participants = volunteers.map(&:user)
      other = create(:volunteer)
      expect(service.projects_participants([project]).map(&:id)).to match_array participants.map(&:id)
    end

    it "returns participants of a given project since a given date" do
      project = create(:project)
      other_project = create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, post: idea, author: pp2)
        create(:idea, project: project, author: others.first)
      end
      travel_to Time.now - 2.days do
        create(:vote, votable: idea, mode: 'up', user: pp3)
        create(:comment, post: idea, author: pp2)
        create(:comment, author: others.last)
      end
      create(:comment, post: idea, author: pp4)

      expect(service.projects_participants([project], since: (Time.now-5.days)).map(&:id)).to match_array [pp2.id, pp3.id, pp4.id]
    end

    it "returns only participants for specific actions" do
      project = create(:continuous_budgeting_project)
      other_project = create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      other = create(:user)

      i = create(:idea, project: project, author: pp1)
      c = create(:comment, post: i, author: pp2)
      v = create(:vote, votable: i, user: pp3)
      b = create(:basket, ideas: [i], participation_context: project, user: pp4)
      create(:idea, author: other)

      expect(service.projects_participants([project], actions: [:posting, :budgeting]).map(&:id)).to match_array [pp1.id, pp4.id]
    end
  end

  describe "topics_participants" do

    it "returns participants of given topics" do
      t1, t2, t3 = create_list(:topic, 3)
      project = create(:project, topics: [t1, t2, t3])
      participants = create_list(:user, 3)
      pp1, pp2, pp3 = participants
      others = create_list(:user, 3)
      i1 = create(:idea, topics: [t1], author: pp1, project: project)
      i2 = create(:idea, topics: [t2,t3], author: pp2, project: project)
      i3 = create(:idea, topics: [t3], author: pp1, project: project)
      i4 = create(:idea, topics: [], author: others.first, project: project)
      create(:comment, post: i1, author: pp3)

      expect(service.topics_participants([t1,t2]).map(&:id)).to match_array participants.map(&:id)
    end

    it "returns only participants for specific actions" do
      project = create(:project)
      other_project = create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      other = create(:user)

      i = create(:idea, project: project, author: pp1)
      c = create(:comment, post: i, author: pp2)
      v1 = create(:vote, votable: i, user: pp3)
      v2 = create(:vote, votable: c, user: pp4)
      create(:idea, author: other)

      expect(service.projects_participants([project], actions: [:comment_voting]).map(&:id)).to match_array [pp4.id]
    end
  end

  describe "idea_statuses_participants" do

    it "returns participants of given idea statuses" do
      s1, s2, s3 = create_list(:idea_status, 3)
      participants = create_list(:user, 3)
      pp1, pp2, pp3 = participants
      others = create_list(:user, 3)
      i1 = create(:idea, idea_status: s1, author: pp1)
      i2 = create(:idea, idea_status: s2, author: pp2)
      i3 = create(:idea, idea_status: s3, author: others.first)
      create(:comment, post: i1, author: pp3)

      expect(service.idea_statuses_participants([s1,s2]).map(&:id)).to match_array participants.map(&:id)
    end

    it "returns only participants for specific actions" do
      project = create(:continuous_budgeting_project)
      other_project = create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      other = create(:user)

      i = create(:idea, project: project, author: pp1)
      c = create(:comment, post: i, author: pp2)
      v = create(:vote, votable: i, user: pp3)
      b = create(:basket, ideas: [i], participation_context: project, user: pp4)
      create(:idea, author: other)

      expect(service.projects_participants([project], actions: [:commenting]).map(&:id)).to match_array [pp2.id]
    end
  end

  describe "filter_engaging_activities" do

    it "does not filter out an upvote" do
      activity = create(:published_activity)
      expect(service.filter_engaging_activities(Activity.all)).to eq [activity]
    end

    it "filters out an idea changed title activity" do
      activity = create(:changed_title_activity)
      expect(service.filter_engaging_activities(Activity.all)).to be_empty
    end
  end

  describe "with_engagement_scores" do

    it "gives idea publishing a score of 5" do
      activity = create(:published_activity)
      expect(service.with_engagement_scores(Activity.where(id: activity.id)).first.score).to eq 5
    end

    it "gives comment creation a score of 3" do
      activity = create(:comment_created_activity)
      expect(service.with_engagement_scores(Activity.where(id: activity.id)).first.score).to eq 3
    end

    it "gives idea voting a score of 1" do
      upvote_activity = create(:idea_upvoted_activity)
      downvote_activity = create(:idea_downvoted_activity)
      expect(service.with_engagement_scores(Activity.where(id: upvote_activity.id)).first.score).to eq 1
      expect(service.with_engagement_scores(Activity.where(id: downvote_activity.id)).first.score).to eq 1
    end

    it "gives comment voting a score of 1" do
      upvote_activity = create(:comment_upvoted_activity)
      expect(service.with_engagement_scores(Activity.where(id: upvote_activity.id)).first.score).to eq 1
    end

    it "returns 0 for non-engaging activities" do
      activity = create(:changed_body_activity)
      expect(service.with_engagement_scores(Activity.where(id: activity.id)).first.score).to eq 0
    end

    it "allows adding other select fields to the query" do
      activity = create(:published_activity)
      scope = service.with_engagement_scores(Activity.where(id: activity.id).select(:user_id))
      expect(scope.first.user_id).to eq activity.user_id
      expect(scope.first.score).to be_present
    end
  end

end
