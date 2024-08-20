# frozen_string_literal: true

require 'rails_helper'

describe SideFxIdeaService do
  let(:service) { described_class.new }

  describe 'after_import' do
    let(:admin_user) { create(:user) }
    let(:author) { create(:user) }
    let(:idea) { create(:idea, author: author) }

    it "logs a user 'created' activity job if imported" do
      idea.idea_import = create(:idea_import, user_created: true)

      expect { service.after_import(idea, admin_user) }
        .to enqueue_job(LogActivityJob)
        .with(
          author,
          'created',
          admin_user,
          author.created_at.to_i,
          payload: { flow: 'importer' }
        )
        .exactly(1).times
    end

    it "doesn't log a 'create' activity job when a user was not created with the import" do
      idea.idea_import = create(:idea_import, user_created: false)

      expect { service.after_import(idea, admin_user) }
        .not_to enqueue_job(LogActivityJob)
        .with(author, 'created', any_args)
    end

    it "doesn't log a 'create' activity job when the idea was not imported" do
      expect { service.after_import(idea, admin_user) }
        .not_to enqueue_job(LogActivityJob)
        .with(author, 'created', any_args)
    end
  end
end
