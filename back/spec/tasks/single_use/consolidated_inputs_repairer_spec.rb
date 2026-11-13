# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('lib/tasks/single_use/services/consolidated_inputs_repairer')

describe Tasks::SingleUse::Services::ConsolidatedInputsRepairer do
  subject(:repairer) { described_class.new(map, reporter: reporter, execute: execute) }

  let(:reporter) { ScriptReporter.new }
  let(:execute) { true }
  let(:source_phase) { create(:phase, participation_method: 'ideation') }
  let(:target_phase) { create(:phase, participation_method: 'ideation') }
  let(:map) { { target_phase.id => [source_phase.id] } }
  let(:author) { create(:user) }

  def source_idea(title, **attributes)
    create(:idea, project: source_phase.project, phases: [source_phase], title_multiloc: { 'en' => title }, author: author, **attributes)
  end

  # Image URLs are relative in tests, where the uploaders have no asset host; in production they are
  # absolute, which `remote_image_url` needs. The downloader resolves the host itself to guard
  # against SSRF, which WebMock cannot intercept, so that check is turned off here.
  def stub_image_downloads
    allow(IdeaImageUploader).to receive(:asset_host).and_return('https://cdn.example.org')
    allow(CarrierWave::Downloader::Base).to receive(:new).and_wrap_original do |original, *args|
      original.call(*args).tap { |downloader| allow(downloader).to receive(:skip_ssrf_protection?).and_return(true) }
    end
    stub_request(:get, %r{\Ahttps://cdn\.example\.org/}).to_return(
      body: Rails.root.join('spec/fixtures/image1.jpg').read, headers: { 'Content-Type' => 'image/jpeg' }
    )
  end

  def imported_copy(title, **attributes)
    create(:idea, project: target_phase.project, phases: [target_phase], title_multiloc: { 'en' => title }, author: author, **attributes).tap do |idea|
      create(:idea_import, idea: idea)
    end
  end

  describe 'copying comments' do
    let!(:source) { source_idea('Bike lanes') }
    let!(:copy) { imported_copy('bike  LANES') }
    let!(:comment) { create(:comment, idea: source, created_at: 1.year.ago, updated_at: 1.year.ago, body_updated_at: 11.months.ago) }
    let!(:reply) { create(:comment, idea: source, parent: comment, created_at: 11.months.ago) }
    let!(:anonymous_comment) { create(:comment, idea: source, anonymous: true) }
    let!(:deleted_comment) { create(:comment, idea: source, publication_status: 'deleted') }
    let!(:like) { create(:comment_reaction, reactable: comment, created_at: 10.months.ago) }
    let!(:dislike) { create(:comment_reaction, reactable: comment, mode: 'down') }
    let!(:recent_comment) { create(:comment, idea: copy) }

    it 'copies the comments with their author, anonymity, body, status and dates' do
      repairer.run

      copies = copy.reload.comments.where.not(id: recent_comment.id).index_by(&:created_at)
      expect(copies.size).to eq 4
      [comment, reply, anonymous_comment, deleted_comment].map(&:reload).each do |original|
        copied = copies.fetch(original.created_at)
        expect(copied.attributes.slice(*described_class::COPIED_COMMENT_ATTRIBUTES))
          .to eq original.attributes.slice(*described_class::COPIED_COMMENT_ATTRIBUTES)
      end
      expect(copies.fetch(anonymous_comment.created_at)).to have_attributes(anonymous: true, author_id: nil)
    end

    it 'puts the reply under the copy of its parent' do
      repairer.run

      copied_parent = copy.comments.find_by!(created_at: comment.created_at)
      expect(copy.comments.find_by!(created_at: reply.created_at).parent).to eq copied_parent
      expect(copied_parent.reload.children_count).to eq 1
    end

    it 'copies the likes and dislikes of the comments' do
      repairer.run

      copied = copy.comments.find_by!(created_at: comment.created_at)
      expect(copied.reactions.map { |r| r.slice(:user_id, :mode, :created_at) })
        .to match_array([like, dislike].map { |r| r.reload.slice(:user_id, :mode, :created_at) })
      expect(copied.reload).to have_attributes(likes_count: 1, dislikes_count: 1)
    end

    it 'counts only the published comments on the copy and its project' do
      repairer.run

      expect(copy.reload.comments_count).to eq 4 # 3 published copies + the new comment
      expect(target_phase.project.reload.comments_count).to eq 4
    end

    it 'leaves the comments already on the copy, and the source, untouched' do
      expect { repairer.run }.not_to(change { [recent_comment.reload.attributes, source.comments.reload.map(&:attributes)] })
    end

    it 'notifies nobody and logs no activity' do
      expect { repairer.run }.not_to have_enqueued_job(LogActivityJob)
      expect(Notification.count).to eq 0
    end

    it 'reports every comment and reaction it creates' do
      repairer.run

      expect(reporter.creates.map { |c| c[:model_name] }.tally).to eq('Comment' => 4, 'Reaction' => 2)
      expect(repairer.counts).to include(pairs: 1, comments: 4, reactions: 2)
    end

    it 'creates nothing when run a second time' do
      repairer.run
      second = described_class.new(map, reporter: ScriptReporter.new, execute: true)

      expect { second.run }.not_to(change { [Comment.count, Reaction.count] })
    end

    it 'adds a reaction missing from an earlier run' do
      repairer.run
      copied = copy.comments.find_by!(created_at: comment.created_at)
      copied.reactions.find_by!(mode: 'down').destroy!

      described_class.new(map, reporter: ScriptReporter.new, execute: true).run

      expect(copied.reload).to have_attributes(likes_count: 1, dislikes_count: 1)
    end

    it 'restores the date of a parent copied by an earlier run when its reply is added' do
      repairer.run
      copy.comments.find_by!(created_at: reply.reload.created_at).destroy!

      described_class.new(map, reporter: ScriptReporter.new, execute: true).run

      expect(copy.comments.find_by!(created_at: comment.reload.created_at).updated_at).to eq comment.updated_at
    end

    it 'reports nothing for a copy whose transaction rolled back' do
      allow(Comment).to receive(:create!).and_call_original
      allow(Comment).to receive(:create!).with(hash_including('created_at' => reply.reload.created_at)).and_raise('boom')

      repairer.run

      expect(copy.reload.comments).to eq [recent_comment]
      expect(reporter.creates).to be_empty
      expect(repairer.counts).not_to include(:comments, :reactions)
      expect(reporter.errors).to contain_exactly(hash_including(error: 'RuntimeError: boom'))
    end

    context 'in a dry run' do
      let(:execute) { false }

      it 'writes nothing but reports what it would create' do
        expect { repairer.run }.not_to(change { [Comment.count, Reaction.count] })
        expect(repairer.counts).to include(pairs: 1, comments: 4, reactions: 2)
      end
    end
  end

  describe 'matching copies to sources' do
    let(:other_author) { create(:user) }

    it 'ignores inputs posted in the new phase directly' do
      source_idea('Bike lanes')
      create(:idea, project: target_phase.project, phases: [target_phase], title_multiloc: { 'en' => 'Bike lanes' })

      repairer.run

      expect(repairer.counts).to eq({})
      expect(reporter.errors).to be_empty
    end

    it 'breaks a title tie by author name' do
      source_idea('Training', author: other_author)
      wanted = source_idea('Training')
      copy = imported_copy('Training')

      expect(repairer.match(target_phase, [source_phase.id])).to eq [[wanted, copy]]
    end

    it 'skips and reports a copy whose title tie cannot be broken' do
      source_idea('Training')
      source_idea('Training')
      copy = imported_copy('Training')

      expect(repairer.match(target_phase, [source_phase.id])).to be_empty
      expect(reporter.errors).to contain_exactly(hash_including(context: hash_including(copy_id: copy.id)))
    end

    it 'skips and reports a copy with no source' do
      source_idea('Training')
      imported_copy('Training (updated)')

      expect(repairer.match(target_phase, [source_phase.id])).to be_empty
      expect(reporter.errors.size).to eq 1
    end

    it 'skips both copies when two of them claim the same source' do
      source_idea('Training')
      imported_copy('Training')
      imported_copy('Training')

      expect(repairer.match(target_phase, [source_phase.id])).to be_empty
      expect(reporter.errors.size).to eq 2
    end
  end

  describe 'repairing the author' do
    let(:source_author) { create(:user, first_name: 'Thandi', last_name: 'Mokoena') }
    let(:source) { source_idea('Bike lanes', author: source_author) }

    def ghost(first_name: 'Thandi', last_name: 'Mokoena', **attributes)
      create(:user, first_name: first_name, last_name: last_name, email: nil, password: nil, unique_code: SecureRandom.uuid, **attributes)
    end

    def imported_copy_by(user, title: 'Bike lanes', user_created: true)
      create(:idea, project: target_phase.project, phases: [target_phase], title_multiloc: { 'en' => title }, author: user).tap do |idea|
        create(:idea_import, idea: idea, user_created: user_created)
      end
    end

    it 'gives the copy the real author and deletes the placeholder user' do
      source
      placeholder = ghost
      copy = imported_copy_by(placeholder)

      repairer.run

      expect(copy.reload).to have_attributes(
        author_id: source_author.id, anonymous: false,
        author_hash: Idea.create_author_hash(source_author.id, copy.project_id, false)
      )
      expect(User.exists?(placeholder.id)).to be false
      expect(repairer.counts).to include(authors_fixed: 1, ghosts_deleted: 1)
      expect(reporter.deletes).to contain_exactly(hash_including(model_name: 'User', id: placeholder.id))
    end

    it 'makes the copy anonymous when the source is, and deletes the "Anonymous" placeholder' do
      anonymous_source = source_idea('Bike lanes', anonymous: true)
      placeholder = ghost(first_name: 'Anonymous', last_name: nil)
      copy = imported_copy_by(placeholder)

      repairer.run

      expect(copy.reload).to have_attributes(author_id: nil, anonymous: true, author_hash: anonymous_source.author_hash)
      expect(User.exists?(placeholder.id)).to be false
      expect(repairer.counts).to include(made_anonymous: 1, ghosts_deleted: 1)
    end

    it 'gives an author to a copy that has none' do
      source
      copy = imported_copy_by(nil, user_created: false)

      repairer.run

      expect(copy.reload.author_id).to eq source_author.id
      expect(repairer.counts).to include(authors_fixed: 1)
      expect(repairer.counts).not_to include(:ghosts_deleted)
    end

    it 'leaves a copy that already has the right author untouched' do
      source
      copy = imported_copy_by(source_author, user_created: false)

      expect { repairer.run }.not_to(change { copy.reload.attributes })
      expect(repairer.counts).not_to include(:authors_fixed)
    end

    it 'keeps and reports a placeholder user that has an email' do
      source
      placeholder = ghost(email: 'thandi@example.com')
      imported_copy_by(placeholder)

      repairer.run

      expect(User.exists?(placeholder.id)).to be true
      expect(repairer.counts).to include(authors_fixed: 1, ghosts_kept: 1)
      expect(reporter.errors).to contain_exactly(hash_including(context: hash_including(user_id: placeholder.id)))
    end

    it 'keeps a placeholder user that authors another input' do
      source
      placeholder = ghost
      imported_copy_by(placeholder)
      create(:idea, author: placeholder)

      repairer.run

      expect(User.exists?(placeholder.id)).to be true
      expect(repairer.counts).to include(ghosts_kept: 1)
    end

    it "keeps the source's hash when the source author deleted their account" do
      deleted_author_source = source_idea('Bike lanes', author: nil)
      deleted_author_source.update_columns(author_hash: 'hash-of-the-deleted-author')
      copy = imported_copy_by(ghost)

      repairer.run

      expect(copy.reload).to have_attributes(author_id: nil, anonymous: false, author_hash: 'hash-of-the-deleted-author')
    end

    it "breaks a title tie with the placeholder's name" do
      source_idea('Bike lanes', author: create(:user, first_name: 'Sipho', last_name: 'Dlamini'))
      source
      copy = imported_copy_by(ghost)

      expect(repairer.match(target_phase, [source_phase.id])).to eq [[source, copy]]
    end

    it 'logs no activity but the placeholder deletion, and notifies nobody' do
      source
      imported_copy_by(ghost)

      expect { repairer.run }.to have_enqueued_job(LogActivityJob).exactly(:once)
      expect(Notification.count).to eq 0
    end

    context 'in a dry run' do
      let(:execute) { false }

      it 'changes nothing and deletes nobody' do
        source
        placeholder = ghost
        copy = imported_copy_by(placeholder)

        repairer.run

        expect(copy.reload.author_id).to eq placeholder.id
        expect(User.exists?(placeholder.id)).to be true
        expect(repairer.counts).to include(authors_fixed: 1, ghosts_deleted: 1)
      end
    end
  end

  describe "copying the author's like" do
    let!(:source) { source_idea('Bike lanes') }
    let!(:copy) { imported_copy('Bike lanes') }

    it 'copies the reaction the author gave their source' do
      like = create(:reaction, reactable: source, user: author, created_at: 1.year.ago)

      repairer.run

      expect(copy.reload.reactions.map { |r| r.slice(:user_id, :mode, :created_at) }).to eq [like.reload.slice(:user_id, :mode, :created_at)]
      expect(copy.likes_count).to eq 1
    end

    it 'copies nothing when the author had not reacted, or other people did' do
      create(:reaction, reactable: source)

      expect { repairer.run }.not_to(change { copy.reactions.count })
    end

    it 'copies nothing when the author has already reacted on the copy' do
      create(:reaction, reactable: source, user: author)
      create(:dislike, reactable: copy, user: author)

      expect { repairer.run }.not_to(change { copy.reactions.count })
    end

    it 'copies nothing for an anonymous source' do
      source.update!(anonymous: true)
      create(:reaction, reactable: source)

      repairer.run

      expect(repairer.counts).not_to include(:author_reactions)
    end
  end

  describe 'copying images' do
    let!(:source) { source_idea('Bike lanes') }
    let!(:copy) { imported_copy('Bike lanes') }

    before { stub_image_downloads }

    it 'copies the images with their ordering' do
      create(:idea_image, idea: source, ordering: 1)
      create(:idea_image, idea: source, ordering: 0)

      repairer.run

      expect(reporter.errors).to be_empty
      expect(copy.reload.idea_images.map(&:ordering)).to eq [0, 1]
      expect(copy.idea_images).to all(have_attributes(image: be_present))
      expect(repairer.counts).to include(images: 2)
    end

    it 'copies nothing when the copy already has an image' do
      create(:idea_image, idea: source)
      create(:idea_image, idea: copy)

      expect { repairer.run }.not_to(change { copy.idea_images.count })
    end

    context 'when an image cannot be downloaded' do
      before do
        create(:idea_image, idea: source)
        create(:comment, idea: source)
        stub_request(:get, %r{\Ahttps://cdn\.example\.org/}).to_return(status: 404)
      end

      it 'reports it and still repairs the rest of the copy' do
        repairer.run

        expect(copy.reload.idea_images).to be_empty
        expect(copy.comments.count).to eq 1
        expect(repairer.counts).to include(images_failed: 1, comments: 1)
        expect(reporter.errors).to contain_exactly(hash_including(error: start_with('Image not copied')))
      end

      context 'in a dry run' do
        let(:execute) { false }

        it 'reports the broken image before the real run' do
          expect { repairer.run }.not_to(change(IdeaImage, :count))
          expect(repairer.counts).to include(images_failed: 1)
          expect(reporter.errors).to contain_exactly(hash_including(error: start_with('Image not copied')))
        end
      end
    end
  end

  describe 'copying follows' do
    let!(:source) { source_idea('Bike lanes') }
    let!(:copy) { imported_copy('Bike lanes') }
    let(:commenter) { create(:user) }

    it "copies the source's followers, without duplicates" do
      create(:follower, followable: source, user: author)
      create(:follower, followable: source, user: commenter)
      create(:follower, followable: copy, user: commenter)

      repairer.run

      expect(copy.reload.followers.map(&:user_id)).to contain_exactly(author.id, commenter.id)
      expect(repairer.counts).to include(followers: 1)
    end

    it 'does not follow the copy for someone who unfollowed the source' do
      create(:follower, followable: source, user: author).destroy!

      repairer.run

      expect(copy.reload.followers).to be_empty
    end
  end

  describe 'running twice' do
    let(:source_author) { create(:user) }
    let!(:source) { source_idea('Bike lanes', author: source_author) }

    before do
      stub_image_downloads
      placeholder = create(:user, first_name: source_author.first_name, last_name: source_author.last_name, email: nil, password: nil, unique_code: SecureRandom.uuid)
      copy = create(:idea, project: target_phase.project, phases: [target_phase], title_multiloc: { 'en' => 'Bike lanes' }, author: placeholder)
      create(:idea_import, idea: copy, user_created: true)
      create(:reaction, reactable: source, user: source_author)
      create(:idea_image, idea: source)
      create(:follower, followable: source, user: source_author)
      create(:comment, idea: source)
    end

    it 'writes and deletes nothing the second time' do
      repairer.run
      expect(reporter.errors).to be_empty
      expect(repairer.counts).to include(authors_fixed: 1, ghosts_deleted: 1, author_reactions: 1, images: 1, followers: 1, comments: 1)
      second = described_class.new(map, reporter: ScriptReporter.new, execute: true)

      expect { second.run }.not_to(change { [User.count, Idea.pluck(:author_id).sort, Reaction.count, IdeaImage.count, Follower.count, Comment.count] })
      expect(second.counts).to eq(pairs: 1)
    end
  end
end
