# frozen_string_literal: true

require 'rails_helper'

describe SideFxReactionService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it "logs a 'liked' action when a like on an idea is created" do
      reaction = create(:reaction, mode: 'up', reactable: create(:idea))
      expect { service.after_create(reaction, user) }
        .to have_enqueued_job(LogActivityJob)
    end

    it "logs a 'liked' action when a like on an initiative is created" do
      reaction = create(:reaction, mode: 'up', reactable: create(:initiative))
      expect { service.after_create(reaction, user) }
        .to(have_enqueued_job(LogActivityJob).with do |reaction_arg, action, *_args, **kwargs|
          expect(reaction_arg).to be_a(String)
          expect(action).to eq('initiative_liked')
          expect(kwargs[:project_id]).to be_blank
        end)
    end

    it "logs a 'disliked' action when a dislike is created" do
      reaction = create(:reaction, mode: 'down', reactable: create(:idea))
      expect { service.after_create(reaction, user) }
        .to(have_enqueued_job(LogActivityJob).with do |*_args, **kwargs|
          expect(kwargs[:project_id]).to be_present
        end)
    end

    # Test for regression of bugfix to prevent case where an exception occurs due to resource being
    # deleted before the job to log an Activity recording its creation is run. See CL-1962.
    it "logs a 'liked' action when a like on an initiative is created and then immediately removed", active_job_inline_adapter: true do
      reaction = create(:reaction, mode: 'up', reactable: create(:initiative))
      reaction.destroy!
      allow(PublishActivityToRabbitJob).to receive(:perform_later)
      service.after_create(reaction, user)
      expect(Activity.where(action: 'initiative_liked').first).to be_present
    end

    it 'creates a follower' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])
      idea = create(:idea, project: project)
      reaction = create(:reaction, reactable: idea)

      expect do
        service.after_create reaction.reload, user
      end.to change(Follower, :count).from(0).to(2)

      expect(user.follows.pluck(:followable_id)).to contain_exactly project.id, folder.id
    end

    it 'does not create a follower if the user already follows the project' do
      project = create(:project)
      idea = create(:idea, project: project)
      reaction = create(:reaction, reactable: idea)
      create(:follower, followable: project, user: user)

      expect do
        service.after_create reaction, user
      end.not_to change(Follower, :count)
    end
  end

  describe 'after_destroy' do
    it "logs a 'canceled_idea_liked' action job when a like is deleted" do
      reaction = create(:reaction, mode: 'up')
      freeze_time do
        frozen_reaction = reaction.destroy
        expect { service.after_destroy(frozen_reaction, user) }
          .to(have_enqueued_job(LogActivityJob).with do |_reaction, action, *_args, **kwargs|
            expect(action).to eq('canceled_idea_liked')
            expect(kwargs[:project_id]).to be_present
          end)
      end
    end

    it "logs a 'canceled_idea_disliked' action job when a dislike is deleted" do
      reaction = create(:reaction, mode: 'down')
      freeze_time do
        frozen_reaction = reaction.destroy
        expect { service.after_destroy(frozen_reaction, user) }
          .to(have_enqueued_job(LogActivityJob).with do |_reaction, action, *_args, **kwargs|
                expect(action).to eq('canceled_idea_disliked')
                expect(kwargs[:project_id]).to be_present
              end)
      end
    end
  end
end
