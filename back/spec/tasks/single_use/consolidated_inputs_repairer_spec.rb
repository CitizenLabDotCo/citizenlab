# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('lib/tasks/single_use/services/consolidated_inputs_repairer')

describe Tasks::SingleUse::Services::ConsolidatedInputsRepairer do
  subject(:copier) { described_class.new(map, reporter: reporter, execute: execute) }

  let(:reporter) { ScriptReporter.new }
  let(:execute) { true }
  let(:old_phase) { create(:phase, participation_method: 'ideation') }
  let(:new_phase) { create(:phase, participation_method: 'ideation') }
  let(:map) { { new_phase.id => [old_phase.id] } }
  let(:author) { create(:user) }

  def source_idea(title, **attributes)
    create(:idea, project: old_phase.project, phases: [old_phase], title_multiloc: { 'en' => title }, author: author, **attributes)
  end

  def imported_copy(title, **attributes)
    create(:idea, project: new_phase.project, phases: [new_phase], title_multiloc: { 'en' => title }, author: author, **attributes).tap do |idea|
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
    let!(:new_comment) { create(:comment, idea: copy) }

    it 'copies the comments with their author, anonymity, body, status and dates' do
      copier.run

      copies = copy.reload.comments.where.not(id: new_comment.id).index_by(&:created_at)
      expect(copies.size).to eq 4
      [comment, reply, anonymous_comment, deleted_comment].map(&:reload).each do |original|
        copied = copies.fetch(original.created_at)
        expect(copied.attributes.slice(*described_class::COPIED_COMMENT_ATTRIBUTES))
          .to eq original.attributes.slice(*described_class::COPIED_COMMENT_ATTRIBUTES)
      end
      expect(copies.fetch(anonymous_comment.created_at)).to have_attributes(anonymous: true, author_id: nil)
    end

    it 'puts the reply under the copy of its parent' do
      copier.run

      copied_parent = copy.comments.find_by!(created_at: comment.created_at)
      expect(copy.comments.find_by!(created_at: reply.created_at).parent).to eq copied_parent
      expect(copied_parent.reload.children_count).to eq 1
    end

    it 'copies the likes and dislikes of the comments' do
      copier.run

      copied = copy.comments.find_by!(created_at: comment.created_at)
      expect(copied.reactions.map { |r| r.slice(:user_id, :mode, :created_at) })
        .to match_array([like, dislike].map { |r| r.reload.slice(:user_id, :mode, :created_at) })
      expect(copied.reload).to have_attributes(likes_count: 1, dislikes_count: 1)
    end

    it 'counts only the published comments on the copy and its project' do
      copier.run

      expect(copy.reload.comments_count).to eq 4 # 3 published copies + the new comment
      expect(new_phase.project.reload.comments_count).to eq 4
    end

    it 'leaves the comments already on the copy, and the source, untouched' do
      expect { copier.run }.not_to(change { [new_comment.reload.attributes, source.comments.reload.map(&:attributes)] })
    end

    it 'notifies nobody and logs no activity' do
      expect { copier.run }.not_to have_enqueued_job(LogActivityJob)
      expect(Notification.count).to eq 0
    end

    it 'reports every comment and reaction it creates' do
      copier.run

      expect(reporter.creates.map { |c| c[:model_name] }.tally).to eq('Comment' => 4, 'Reaction' => 2)
      expect(copier.counts).to include(pairs: 1, comments: 4, reactions: 2)
    end

    it 'creates nothing when run a second time' do
      copier.run
      second = described_class.new(map, reporter: ScriptReporter.new, execute: true)

      expect { second.run }.not_to(change { [Comment.count, Reaction.count] })
    end

    it 'adds a reaction missing from an earlier run' do
      copier.run
      copied = copy.comments.find_by!(created_at: comment.created_at)
      copied.reactions.find_by!(mode: 'down').destroy!

      described_class.new(map, reporter: ScriptReporter.new, execute: true).run

      expect(copied.reload).to have_attributes(likes_count: 1, dislikes_count: 1)
    end

    it 'restores the date of a parent copied by an earlier run when its reply is added' do
      copier.run
      copy.comments.find_by!(created_at: reply.reload.created_at).destroy!

      described_class.new(map, reporter: ScriptReporter.new, execute: true).run

      expect(copy.comments.find_by!(created_at: comment.reload.created_at).updated_at).to eq comment.updated_at
    end

    it 'reports nothing for a copy whose transaction rolled back' do
      allow(Comment).to receive(:create!).and_call_original
      allow(Comment).to receive(:create!).with(hash_including('created_at' => reply.reload.created_at)).and_raise('boom')

      copier.run

      expect(copy.reload.comments).to eq [new_comment]
      expect(reporter.creates).to be_empty
      expect(copier.counts).not_to include(:comments, :reactions)
      expect(reporter.errors).to contain_exactly(hash_including(error: 'RuntimeError: boom'))
    end

    context 'in a dry run' do
      let(:execute) { false }

      it 'writes nothing but reports what it would create' do
        expect { copier.run }.not_to(change { [Comment.count, Reaction.count] })
        expect(copier.counts).to include(pairs: 1, comments: 4, reactions: 2)
      end
    end
  end

  describe 'matching copies to sources' do
    let(:other_author) { create(:user) }

    it 'ignores inputs posted in the new phase directly' do
      source_idea('Bike lanes')
      create(:idea, project: new_phase.project, phases: [new_phase], title_multiloc: { 'en' => 'Bike lanes' })

      copier.run

      expect(copier.counts).to eq({})
      expect(reporter.errors).to be_empty
    end

    it 'breaks a title tie by author' do
      source_idea('Training', author: other_author)
      wanted = source_idea('Training')
      copy = imported_copy('Training')

      expect(copier.match(new_phase, [old_phase.id])).to eq [[wanted, copy]]
    end

    it 'skips and reports a copy whose title tie cannot be broken' do
      source_idea('Training')
      source_idea('Training')
      copy = imported_copy('Training')

      expect(copier.match(new_phase, [old_phase.id])).to be_empty
      expect(reporter.errors).to contain_exactly(hash_including(context: hash_including(copy_id: copy.id)))
    end

    it 'skips and reports a copy with no source' do
      source_idea('Training')
      imported_copy('Training (updated)')

      expect(copier.match(new_phase, [old_phase.id])).to be_empty
      expect(reporter.errors.size).to eq 1
    end

    it 'skips both copies when two of them claim the same source' do
      source_idea('Training')
      imported_copy('Training')
      imported_copy('Training')

      expect(copier.match(new_phase, [old_phase.id])).to be_empty
      expect(reporter.errors.size).to eq 2
    end
  end
end
