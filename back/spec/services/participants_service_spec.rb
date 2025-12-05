# frozen_string_literal: true

require 'rails_helper'

describe ParticipantsService do
  let(:service) { described_class.new }

  describe 'participants' do
    before_all do
      Analytics::PopulateDimensionsService.populate_types
    end

    it 'returns participants across the whole platform at any time' do
      participants = create_list(:user, 5)
      pp1, pp2, pp3, pp4, pp5 = participants
      others = create_list(:user, 3)

      idea = nil

      travel_to Time.now - 100.days do
        idea = create(:idea, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, author: pp2, idea: idea)
      end
      travel_to Time.now - 2.days do
        create(:comment, author: pp3, idea: idea)
        create(:idea, author: others.first, publication_status: 'draft')
      end
      create(:idea, author: pp4)
      create(:poll_response, user: pp5)

      expect(service.participants.map(&:dimension_user_id)).to match_array participants.map(&:id)
    end

    it 'returns participants across the whole platform since a given date' do
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      create_list(:user, 3)

      idea = nil

      travel_to Time.now - 100.days do
        idea = create(:idea, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, idea: idea, author: pp2)
      end
      travel_to Time.now - 2.days do
        create(:comment, idea: idea, author: pp3)
      end
      create(:comment, idea: idea, author: pp4)

      expect(service.participants(since: (Time.now - 6.days)).map(&:dimension_user_id)).to contain_exactly(pp2.id, pp3.id, pp4.id)
    end
  end

  describe 'project_participants_count' do
    before_all do
      Analytics::PopulateDimensionsService.populate_types
    end

    it 'correctly deduplicates users' do
      project = create(:project)
      user = create(:user)

      # Create a bunch of ideas and comments with users (4 participants)
      idea1 = create(:idea, project: project, author: user) # 1
      idea2 = create(:idea, project: project) # 2
      create(:comment, idea: idea1) # 3
      create(:idea, project: project) # 4
      create(:comment, idea: idea2, author: user)

      expect(service.project_participants_count(project)).to eq 4
    end

    it 'correctly deduplicates anonymous users' do
      project = create(:project)
      user = create(:user)

      idea = create(:idea, project: project, author: user, anonymous: true)
      create(:idea, project: project, author: user, anonymous: true)
      create(:comment, idea: idea, author: user, anonymous: true)

      expect(service.project_participants_count(project)).to eq 1
    end

    it 'counts ideas without a user_id or author_hash as separate participants' do
      project = create(:project)
      create(:idea, project: project, anonymous: false, author: nil)
      create(:idea, project: project, anonymous: false, author: nil)

      expect(service.project_participants_count(project)).to eq 2
    end

    it 'caches the result for 1 day' do
      project = create(:project)
      create(:idea, project: project)
      expect(service.project_participants_count(project)).to eq 1

      create(:idea, project: project)
      expect(service.project_participants_count(project)).to eq 1
      expect(service.project_participants_count_uncached(project)).to eq 2
    end

    it 'returns the count of participants' do
      project = create(:project)
      pp1, pp2, pp3, pp4 = create_list(:user, 4)

      # Create a bunch of ideas and comments with users (4 participants)
      idea1 = create(:idea, project: project, author: pp1) # 1
      idea2 = create(:idea, project: project, author: pp2) # 2
      create(:comment, idea: idea1, author: pp3) # 3
      create(:idea, project: project) # 4
      create(:comment, idea: idea2, author: pp1)

      # Create two ideas and a comment, anonymous, but all for the same user (1 participant)
      idea3 = create(:idea, project: project, author: pp4, anonymous: true)
      create(:idea, project: project, author: pp4, anonymous: true)
      create(:comment, idea: idea3, author: pp4, anonymous: true)

      # Create another anonymous idea for another user (1 participant)
      create(:idea, project: project, anonymous: true)

      # Add two ideas, not anonymous but no user_id or author_hash (2 participants)
      create(:idea, project: project, anonymous: false, author: nil)
      create(:idea, project: project, anonymous: false, author: nil)

      expect(service.project_participants_count(project)).to eq 8
    end

    it 'returns total project participant count including anonymous posts & everyone surveys' do
      create(:idea_status_proposed)
      project = create(:project)
      pp1, pp2, pp3, pp4, pp5 = create_list(:user, 5)

      # Normal participation +3
      idea1 = create(:idea, project: project, author: pp1)
      idea2 = create(:idea, project: project, author: pp2)
      create(:idea, project: project, author: pp3)
      create(:comment, idea: idea1, author: pp3)
      create(:comment, idea: idea2, author: pp3)
      create(:comment, idea: idea2, author: pp2)
      expect(service.project_participants_count_uncached(project)).to eq 3

      # Anonymous & participated already +2
      create(:idea, project: project, author: pp2, anonymous: true)
      create(:comment, idea: idea1, author: pp3, anonymous: true)
      expect(service.project_participants_count_uncached(project)).to eq 5

      # Only participated anonymously +2
      create(:idea, project: project, author: pp4, anonymous: true)
      create(:comment, idea: idea1, author: pp4, anonymous: true)
      create(:comment, idea: idea1, author: pp5, anonymous: true)
      expect(service.project_participants_count_uncached(project)).to eq 7

      # 'everyone' surveys +2
      phase = create(:native_survey_phase, project: project)
      create(:native_survey_response, project: project, creation_phase: phase, author: nil, title_multiloc: { 'en' => 'title' }, body_multiloc: { 'en' => 'body' })
      create(:native_survey_response, project: project, creation_phase: phase, author: nil, title_multiloc: { 'en' => 'title' }, body_multiloc: { 'en' => 'body' })
      expect(service.project_participants_count_uncached(project)).to eq 9
    end
  end

  describe 'projects_participants_counts' do
    before_all do
      Analytics::PopulateDimensionsService.populate_types
    end

    it 'returns the count of participants' do
      project1 = create(:project)
      project2 = create(:project)
      pp1, pp2, pp3, pp4 = create_list(:user, 4)

      ## PROJECT 1 (8 participants)

      # Create a bunch of ideas and comments with users (4 participants)
      idea1 = create(:idea, project: project1, author: pp1) # 1
      idea2 = create(:idea, project: project1, author: pp2) # 2
      create(:comment, idea: idea1, author: pp3) # 3
      create(:idea, project: project1) # 4
      create(:comment, idea: idea2, author: pp1)

      # Create two ideas and a comment, anonymous, but all for the same user (1 participant)
      idea3 = create(:idea, project: project1, author: pp4, anonymous: true)
      create(:idea, project: project1, author: pp4, anonymous: true)
      create(:comment, idea: idea3, author: pp4, anonymous: true)

      # Create another anonymous idea for another user (1 participant)
      create(:idea, project: project1, anonymous: true)

      # Add two ideas, not anonymous but no user_id or author_hash (2 participants)
      create(:idea, project: project1, anonymous: false, author: nil)
      create(:idea, project: project1, anonymous: false, author: nil)

      ## PROJECT 2 (3 participants)

      # Create a bunch of ideas (3 participants)
      create(:idea, project: project2, author: pp1) # 1
      create(:idea, project: project2, author: pp2) # 2
      create(:idea, project: project2, author: pp3) # 3
      create(:idea, project: project2, author: pp1) # duplicate of 1

      expect(service.projects_participants_counts([project1, project2])).to eq({
        project1.id => 8,
        project2.id => 3
      })
    end
  end

  describe 'folder_participants_count' do
    before_all do
      Analytics::PopulateDimensionsService.populate_types
    end

    it 'returns the count of participants' do
      projects = create_list(:project, 2)
      folder = create(:project_folder, projects: projects)

      pp1 = create(:user)
      idea1 = create(:idea, project: projects.first, author: pp1) # 1
      idea2 = create(:idea, project: projects.last, anonymous: true) # 2
      create(:idea)
      pp2 = create(:user)
      create(:comment, idea: idea1, author: pp2) # 3
      create(:comment, idea: idea2, author: pp1)

      expect(service.folder_participants_count(folder)).to eq 3
    end
  end

  describe 'projects_participants' do
    it 'returns participants of a given project at any time' do
      project = create(:single_phase_budgeting_project)
      other_project = create(:project)
      participants = create_list(:user, 5)
      pp1, pp2, pp3, pp4, pp5 = participants
      others = create_list(:user, 3)

      idea = nil
      other_idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1, phases: project.phases)
      end
      travel_to Time.now - 6.days do
        create(:comment, idea: idea, author: pp2)
        other_idea = create(:idea, project: other_project, author: others.first, phases: other_project.phases)
      end
      travel_to Time.now - 2.days do
        create(:reaction, reactable: idea, mode: 'up', user: pp3)
        create(:comment, idea: idea, author: pp2)
        create(:comment, idea: other_idea, author: others.last)
        create(:basket, ideas: [idea], phase: project.phases.first, user: pp5)
      end
      create(:comment, idea: idea, author: pp4)

      expect(service.projects_participants([project]).map(&:id)).to match_array participants.map(&:id)
    end

    it 'returns participants of a poll' do
      poll = create(:single_phase_poll_project)
      responses = create_list(:poll_response, 2, phase: poll.phases.first)
      participants = responses.map(&:user)
      create_list(:user, 2)
      create(:poll_response, phase: create(:poll_phase))

      expect(service.projects_participants([poll]).map(&:id)).to match_array participants.map(&:id)
    end

    it 'returns volunteering participants' do
      project = create(:single_phase_volunteering_project)
      cause = create(:cause, phase: project.phases.first)
      volunteers = create_list(:volunteer, 2, cause: cause)
      participants = volunteers.map(&:user)
      create(:volunteer)
      expect(service.projects_participants([project]).map(&:id)).to match_array participants.map(&:id)
    end

    it 'returns participants of a given project since a given date' do
      project = create(:project)
      create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)

      idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, idea: idea, author: pp2)
        create(:idea, project: project, author: others.first)
      end
      travel_to Time.now - 2.days do
        create(:reaction, reactable: idea, mode: 'up', user: pp3)
        create(:comment, idea: idea, author: pp2)
        create(:comment, author: others.last)
      end
      create(:comment, idea: idea, author: pp4)

      expect(service.projects_participants([project], since: (Time.now - 5.days)).map(&:id)).to contain_exactly(pp2.id, pp3.id, pp4.id)
    end

    it 'returns only participants for specific actions' do
      project = create(:single_phase_budgeting_project)
      create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      other = create(:user)

      i = create(:idea, project: project, author: pp1)
      create(:comment, idea: i, author: pp2)
      create(:reaction, reactable: i, user: pp3)
      create(:basket, ideas: [i], phase: project.phases.first, user: pp4)
      create(:idea, author: other)

      expect(service.projects_participants([project], actions: %i[posting voting]).map(&:id)).to contain_exactly(pp1.id, pp4.id)
    end

    it 'returns only participants for comment_reacting' do
      project = create(:project)
      create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      other = create(:user)

      i = create(:idea, project: project, author: pp1)
      c = create(:comment, idea: i, author: pp2)
      create(:reaction, reactable: i, user: pp3)
      create(:reaction, reactable: c, user: pp4)
      create(:idea, author: other)

      expect(service.projects_participants([project], actions: [:comment_reacting]).map(&:id)).to contain_exactly(pp4.id)
    end

    it 'returns only participants for commenting' do
      project = create(:single_phase_budgeting_project)
      create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      other = create(:user)

      i = create(:idea, project: project, author: pp1, phases: project.phases)
      create(:comment, idea: i, author: pp2)
      create(:reaction, reactable: i, user: pp3)
      create(:basket, ideas: [i], phase: project.phases.first, user: pp4)
      create(:idea, author: other)

      expect(service.projects_participants([project], actions: [:commenting]).map(&:id)).to contain_exactly(pp2.id)
    end

    it 'returns event attendees' do
      project = create(:project)
      event = create(:event, project: project)
      attendee1 = create(:event_attendance, event: event).attendee
      attendee2 = create(:event_attendance, event: event).attendee

      expect(service.projects_participants([project]).map(&:id)).to contain_exactly(attendee1.id, attendee2.id)
    end

    it 'does not return followers' do
      project = create(:project)
      create(:follower, followable: project).user
      author = create(:user)
      idea = create(:idea, project: project, author: author)
      create(:follower, followable: idea).user

      expect(service.projects_participants([project]).map(&:id)).to contain_exactly(author.id)
    end

    # Regression test: mainly to avoid counting unsubmitted survey responses as project participation
    it 'does not return users who have only an un-published idea in the project' do
      project = create(:project)
      author = create(:user)
      create(:idea, project: project, author: author, publication_status: 'draft')

      expect(service.projects_participants([project]).map(&:id)).to be_empty
    end
  end

  describe 'topics_participants' do
    it 'returns participants of given topics' do
      t1, t2, t3 = create_list(:topic, 3)
      project = create(:project, allowed_input_topics: [t1, t2, t3])
      participants = create_list(:user, 3)
      pp1, pp2, pp3 = participants
      others = create_list(:user, 3)
      i1 = create(:idea, topics: [t1], author: pp1, project: project)
      create(:idea, topics: [t2, t3], author: pp2, project: project)
      create(:idea, topics: [t3], author: pp1, project: project)
      create(:idea, topics: [], author: others.first, project: project)
      create(:comment, idea: i1, author: pp3)

      expect(service.topics_participants([t1, t2]).map(&:id)).to match_array participants.map(&:id)
    end
  end

  describe 'idea_statuses_participants' do
    it 'returns participants of given idea statuses' do
      s1, s2, s3 = create_list(:idea_status, 3)
      participants = create_list(:user, 3)
      pp1, pp2, pp3 = participants
      others = create_list(:user, 3)
      i1 = create(:idea, idea_status: s1, author: pp1)
      create(:idea, idea_status: s2, author: pp2)
      create(:idea, idea_status: s3, author: others.first)
      create(:comment, idea: i1, author: pp3)

      expect(service.idea_statuses_participants([s1, s2]).map(&:id)).to match_array participants.map(&:id)
    end
  end

  describe 'destroy_participation_data' do
    let_it_be(:project, reload: true) { create(:project) }

    context "when the project doesn't have any voting phases" do
      it 'deletes all project ideas' do
        create_list(:idea, 2, project: project)
        expect { service.destroy_participation_data(project) }.to change(Idea, :count).by(-2)
      end
    end

    context 'when the project has a voting phase' do
      before_all do
        phase = create(:single_voting_phase, project: project)
        idea = create(:idea, project: project, phases: [phase])
        create_list(:basket, 2, ideas: [idea], phase: phase)
        Basket.update_counts(phase)
        create(:comment, idea: idea)
      end

      it 'does not delete ideas associated with the voting phase' do
        expect { service.destroy_participation_data(project) }.not_to change(Idea, :count)
      end

      it 'deletes votes on ideas associated with the voting phase' do
        expect { service.destroy_participation_data(project) }
          .to change(Basket, :count).by(-2)
          # Regression test: Additional check for basket counts since they are not managed
          # by `counter_culture`, unlike the other counts.
          .and change { project.reload.baskets_count }.by(-2)
      end

      it 'deletes comments on ideas associated with the voting phase' do
        expect { service.destroy_participation_data(project) }
          .to change(Comment, :count).by(-1)
      end
    end

    it 'deletes volunteering data' do
      phase = create(:volunteering_phase, project: project)
      cause = create(:cause, phase: phase)
      create_list(:volunteer, 2, cause: cause)
      expect { service.destroy_participation_data(project) }
        .to change(Volunteering::Volunteer, :count).by(-2)
    end

    it 'deletes event registrations' do
      event = create(:event, project: project)
      create_list(:event_attendance, 2, event: event)
      expect { service.destroy_participation_data(project) }
        .to change(Events::Attendance, :count).by(-2)
    end

    it 'deletes poll responses' do
      phase = create(:poll_phase, project: project)
      create_list(:poll_response, 2, phase: phase)
      expect { service.destroy_participation_data(project) }
        .to change(Polls::Response, :count).by(-2)
    end

    # Regression test
    it 'does not delete ideas from other projects' do
      idea = create(:idea)
      voting_phase = create(:single_voting_phase)
      idea_in_voting_phase = create(:idea, phases: [voting_phase], project: voting_phase.project)

      service.destroy_participation_data(project)

      expect(Idea.where(id: idea.id)).to exist
      expect(Idea.where(id: idea_in_voting_phase.id)).to exist
    end
  end
end
