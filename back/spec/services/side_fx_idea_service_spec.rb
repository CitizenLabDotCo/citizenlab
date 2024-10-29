# frozen_string_literal: true

require 'rails_helper'

describe SideFxIdeaService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'created' action activity job" do
      idea = create(:idea, author: user)
      expect { service.after_create(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(
          idea,
          'created',
          user,
          idea.created_at.to_i,
          project_id: idea.project_id,
          payload: { idea: service.send(:serialize_idea, idea) }
        )
        .exactly(1).times
    end

    it "logs a 'submitted' action job when the publication_status is submitted" do
      idea = create(:idea, publication_status: 'submitted', author: user)

      expect { service.after_create(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'submitted', user, idea.submitted_at.to_i, project_id: idea.project_id)
        .exactly(1).times
    end

    it "logs a 'submitted' action job when the publication_status is published" do
      idea = create(:idea, publication_status: 'published', author: user)

      expect { service.after_create(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'submitted', user, idea.submitted_at.to_i, project_id: idea.project_id)
        .exactly(1).times
    end

    it "logs a 'published' action job when the publication_status is published" do
      idea = create(:idea, publication_status: 'published', author: user)

      expect { service.after_create(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'published', user, idea.published_at.to_i, project_id: idea.project_id)
        .exactly(1).times
        .and enqueue_job(Seo::ScrapeFacebookJob).exactly(1).times
    end

    it "doesn't log a 'submitted' action job when the publication_status is draft" do
      idea = create(:idea, publication_status: 'draft')
      expect { service.after_create(idea, user) }
        .not_to enqueue_job(LogActivityJob)
        .with(idea, 'submitted', any_args)
    end

    it "doesn't log a 'published' action job when the publication_status is draft" do
      idea = create(:idea, publication_status: 'draft')
      expect { service.after_create(idea, user) }
        .not_to enqueue_job(LogActivityJob)
        .with(idea, 'published', any_args)
    end

    it 'creates a follower' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])
      idea = create(:idea, project: project)

      expect do
        service.after_create idea.reload, user
      end.to change(Follower, :count).from(0).to(3)

      expect(user.follows.pluck(:followable_id)).to contain_exactly idea.id, project.id, folder.id
    end

    it 'creates a cosponsorship' do
      cosponsor = create(:user)
      idea = create(:idea, cosponsor_ids: [cosponsor.id])

      expect { service.after_create idea.reload, user }
        .to enqueue_job(LogActivityJob)
        .with(
          idea.cosponsorships.first,
          'created',
          user,
          idea.cosponsorships.first.created_at.to_i
        )
        .exactly(1).times
    end

    it 'sets the manual_votes_count of its phases' do
      project = create(:project)
      phase1 = create(:phase, project: project)
      phase2 = create(:phase, project: project, start_at: phase1.end_at + 1.day, end_at: phase1.end_at + 2.days) # TODO: Make create_list(:phase, 2, project: project) work
      create(:idea, manual_votes_amount: 2, project: project, phases: [phase1])
      phase1.update_manual_votes_count!
      idea = create(:idea, manual_votes_amount: 3, project: project, phases: [phase1, phase2])
      service.after_create(idea, user)

      expect(phase1.reload.manual_votes_count).to eq 5
      expect(phase2.reload.manual_votes_count).to eq 3
    end
  end

  describe 'after_update' do
    it "logs a 'submitted' action job when the publication_status goes from draft to submitted" do
      idea = create(:idea, publication_status: 'draft', author: user)
      idea.update!(publication_status: 'submitted')

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'submitted', user, idea.submitted_at.to_i, project_id: idea.project_id)
        .exactly(1).times
    end

    it "logs a 'submitted' action job when the publication_status goes from draft to published" do
      idea = create(:idea, publication_status: 'draft', author: user)
      idea.update!(publication_status: 'published')

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'submitted', user, idea.submitted_at.to_i, project_id: idea.project_id)
        .exactly(1).times
    end

    it "doesn't log a 'submitted' action job when the publication_status goes from submitted to published" do
      idea = create(:idea, publication_status: 'submitted', author: user)
      idea.update!(publication_status: 'published')
      expect { service.after_update(idea, user) }
        .not_to enqueue_job(LogActivityJob)
        .with(idea, 'submitted', any_args)
    end

    it "logs a 'published' action job when the publication_status goes from draft to published" do
      idea = create(:idea, publication_status: 'draft', author: user)
      idea.update!(publication_status: 'published')

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'published', user, idea.published_at.to_i, project_id: idea.project_id)
        .exactly(1).times
    end

    it "logs a 'published' action job when the publication_status goes from submitted to published" do
      idea = create(:idea, publication_status: 'submitted', author: user)
      idea.update!(publication_status: 'published')

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'published', user, idea.published_at.to_i, project_id: idea.project_id)
        .exactly(1).times
    end

    it "logs a 'changed' action job when the idea has changed" do
      idea = create(:idea)
      old_title_multiloc = idea.title_multiloc

      idea.update!(title_multiloc: { en: 'something else' })
      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob).with(
          idea,
          'changed',
          user,
          idea.updated_at.to_i,
          payload: {
            change: { title_multiloc: [old_title_multiloc, { en: 'something else' }] },
            idea: service.send(:serialize_idea, idea)
          },
          project_id: idea.project_id
        ).exactly(1).times
        .and enqueue_job(Seo::ScrapeFacebookJob).exactly(1).times
    end

    it "logs changes to location_point in 'changed' action payload" do
      idea = create(:idea)
      old_location_point = idea.location_point_geojson

      idea.update!(location_point_geojson: { 'type' => 'Point', 'coordinates' => [42.42, 42.42] })

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob).with(
          idea,
          'changed',
          user,
          idea.updated_at.to_i,
          payload: {
            change: { location_point: [old_location_point, { type: 'Point', coordinates: [42.42, 42.42] }] },
            idea: service.send(:serialize_idea, idea)
          },
          project_id: idea.project_id
        ).exactly(1).times
        .and enqueue_job(Seo::ScrapeFacebookJob).exactly(1).times
    end

    it "logs a 'changed_title' action job when the title has changed" do
      idea = create(:idea)
      old_idea_title = idea.title_multiloc
      idea.update!(title_multiloc: { en: 'changed' })

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob).with(
          idea,
          'changed_title',
          any_args,
          payload: { change: [old_idea_title, idea.title_multiloc] },
          project_id: idea.project_id
        ).exactly(1).times
    end

    it "logs a 'changed_body' action job when the body has changed" do
      idea = create(:idea)
      old_idea_body = idea.body_multiloc
      idea.update!(body_multiloc: { en: 'changed' })

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob).with(
          idea,
          'changed_body',
          any_args,
          payload: { change: [old_idea_body, idea.body_multiloc] },
          project_id: idea.project_id
        )
    end

    it "logs a 'changed_status' action job when the idea_status has changed" do
      idea = create(:idea)
      old_idea_status = idea.idea_status
      new_idea_status = create(:idea_status)
      idea.update!(idea_status: new_idea_status)

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob).with(
          idea,
          'changed_status',
          user,
          idea.updated_at.to_i,
          payload: { change: [old_idea_status.id, new_idea_status.id] },
          project_id: idea.project_id
        ).exactly(1).times
    end

    it 'creates a cosponsorship when cosponsor_ids change' do
      cosponsor = create(:user)

      idea = create(:idea)
      idea.update!(cosponsor_ids: [cosponsor.id])

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(
          idea.cosponsorships.first,
          'created',
          user,
          idea.cosponsorships.first.created_at.to_i
        ).exactly(1).times
    end

    it 'sets the manual_votes_count after removing a phase' do
      phase = create(:phase)
      create(:idea, manual_votes_amount: 2, project: phase.project, phases: [phase])
      idea = create(:idea, manual_votes_amount: 1, project: phase.project, phases: [phase])
      phase.update_manual_votes_count!
      service.before_update(idea, user)
      idea.update!(phase_ids: [])
      service.after_update(idea, user)

      expect(phase.reload.manual_votes_count).to eq 2
    end

    # Adding phase
    # Changing manual_votes_amount (to zero or nil)
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the idea is destroyed" do
      idea = create(:idea)
      freeze_time do
        frozen_idea = idea.destroy
        expect { service.after_destroy(frozen_idea, user) }
          .to enqueue_job(LogActivityJob).exactly(1).times
      end
    end

    it 'sets the manual_votes_count of its phases' do
      phase = create(:phase)
      create(:idea, manual_votes_amount: 2, project: phase.project, phases: [phase])
      idea = create(:idea, manual_votes_amount: 3, project: phase.project, phases: [phase])
      phase.update_manual_votes_count!
      idea.destroy!
      service.after_destroy(idea, user)

      expect(phase.reload.manual_votes_count).to eq 2
    end
  end
end
