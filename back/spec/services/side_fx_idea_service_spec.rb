# frozen_string_literal: true

require 'rails_helper'

describe SideFxIdeaService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'published' action job when publication_state is published" do
      idea = create(:idea, publication_status: 'published', author: user)

      expect { service.after_create(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'published', user, idea.created_at.to_i, project_id: idea.project_id)
        .exactly(1).times
        .and enqueue_job(Seo::ScrapeFacebookJob).exactly(1).times
    end

    it "doesn't log a 'published' action job when publication_state is draft" do
      idea = create(:idea, publication_status: 'draft')
      expect { service.after_create(idea, user) }
        .not_to enqueue_job(LogActivityJob)
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
  end

  describe 'after_update' do
    it "logs a 'published' action job when publication_state goes from draft to published" do
      idea = create(:idea, publication_status: 'draft', author: user)
      idea.update(publication_status: 'published')

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob)
        .with(idea, 'published', user, idea.published_at.to_i, project_id: idea.project_id)
        .exactly(1).times
    end

    it "logs a 'changed' action job when the idea has changed" do
      idea = create(:idea)
      idea.update!(title_multiloc: { en: 'something else' })
      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob).with(idea, 'changed', any_args).exactly(1).times
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
  end
end
