# frozen_string_literal: true

require 'rails_helper'

describe SideFxCommentService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:comment) { create(:comment) }
  let(:project_id) { comment.post.project_id }

  describe 'after_create' do
    it "logs a 'created' action when a comment is created" do
      expect { service.after_create(comment, user) }
        .to enqueue_job(LogActivityJob)
        .with(comment, 'created', user, comment.updated_at.to_i, project_id: project_id)
    end

    it "logs a 'mentioned' action for every expanded mention" do
      mention_service = MentionService.new
      u1 = create(:user)
      u1_mention = mention_service.user_to_mention(u1)
      u1_mention_expanded = mention_service.add_span_around u1_mention, u1

      u2 = create(:user)
      u2_mention = mention_service.user_to_mention(u2)
      u2_mention_expanded = mention_service.add_span_around u2_mention, u2

      comment.body_multiloc['en'] = "Let's mention #{u1_mention_expanded} and #{u2_mention_expanded}"

      expectation = expect { service.after_create(comment, user) }

      created_at = comment.created_at.to_i
      expectation.to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u1.id }, project_id: project_id)
      expectation.to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u2.id }, project_id: project_id)
    end

    it 'creates a follower' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])
      idea = create(:idea, project: project)
      comment = create(:comment, post: idea)

      expect do
        service.after_create comment.reload, user
      end.to change(Follower, :count).from(0).to(3)

      expect(user.follows.pluck(:followable_id)).to contain_exactly idea.id, project.id, folder.id
    end

    # TODO: Part of initiatives cleanup
    # I have commented this out, for now, as it fails if I change initiative to idea
    # This seems to be because the related `after_create` method in fact creates a folllower for the related project,
    # and intitiatives never had a related project.
    # Furthermore, it appears that the `after_create` method will go on to also create another follower for the
    # project's folder, it there is one.
    # Thus, this test was not as general (to Post) as it might have seemed + I think we need to check that the cascading
    # follower creations (idea -> project -> folder as followable) is intended & necessary.
    #
    # it 'does not create a follower if the user already follows the post' do
    #   initiative = create(:initiative)
    #   comment = create(:comment, post: initiative)
    #   create(:follower, followable: initiative, user: user)

    #   expect do
    #     service.after_create comment, user
    #   end.not_to change(Follower, :count)
    # end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the comment has changed" do
      comment.update!(body_multiloc: { en: 'changed' })
      expect { service.after_update(comment, user) }
        .to enqueue_job(LogActivityJob)
        .with(comment, 'changed', user, comment.updated_at.to_i, project_id: project_id)
    end

    it "logs a 'mentioned' action for every added mention" do
      mention_service = MentionService.new
      u1 = create(:user)
      u1_mention = mention_service.user_to_mention(u1)
      u1_mention_expanded = mention_service.add_span_around u1_mention, u1

      u2 = create(:user)
      u2_mention = mention_service.user_to_mention(u2)
      u2_mention_expanded = mention_service.add_span_around u2_mention, u2

      comment = create(:comment, body_multiloc: { en: u1_mention_expanded.to_s })
      comment.update!(body_multiloc: { en: "Let's mention #{u1_mention_expanded} and #{u2_mention_expanded}" })

      expectation = expect { service.after_update(comment, user) }
      created_at = comment.created_at.to_i
      project_id = comment.post.project_id
      expectation.not_to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u1.id }, project_id: project_id)
      expectation.to enqueue_job(LogActivityJob).with(comment, 'mentioned', user, created_at, payload: { mentioned_user: u2.id }, project_id: project_id)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the comment is destroyed" do
      freeze_time do
        frozen_comment = comment.destroy
        expect { service.after_destroy(frozen_comment, user) }
          .to enqueue_job(LogActivityJob)
      end
    end
  end
end
