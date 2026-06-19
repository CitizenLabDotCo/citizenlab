# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'demos:create_n_up_reactions rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['demos:create_n_up_reactions'].reenable
    # The task writes its JSON report to the working directory.
    FileUtils.rm_f(Rails.root.join('create_n_up_reactions.json'))
  end

  # Author is an admin so the idea's author is never counted as an eligible
  # (regular, active) user — eligibility is controlled entirely by each test.
  let(:idea) { create(:idea, author: create(:admin)) }

  def run_task(host: Tenant.current.host, idea_id: idea.id, n_reactions: 2)
    Rake::Task['demos:create_n_up_reactions'].invoke(host, idea_id, n_reactions.to_s)
  end

  # A regular, active user (active? == true, roles == []).
  def create_regular_active_user
    create(:user) # the factory builds a registered, confirmed user with empty roles
  end

  describe 'on a demo tenant' do
    # The default test tenant is 'active' and the model forbids flipping it to 'demo',
    # so stub the lifecycle_stage the guard reads (passing other lookups through).
    before do
      allow_any_instance_of(AppConfiguration).to receive(:settings).and_call_original
      allow_any_instance_of(AppConfiguration)
        .to receive(:settings).with('core', 'lifecycle_stage').and_return('demo')
    end

    it "creates the requested number of 'up' reactions, each by a different user" do
      3.times { create_regular_active_user }

      expect { run_task(n_reactions: 3) }.to change { idea.reactions.where(mode: 'up').count }.by(3)

      reactions = idea.reactions.where(mode: 'up')
      expect(reactions.map(&:user_id).uniq.size).to eq(3)
    end

    it 'keeps Idea#likes_count in sync' do
      2.times { create_regular_active_user }

      run_task(n_reactions: 2)

      expect(idea.reload.likes_count).to eq(2)
    end

    it 'does not reuse a user who is already reacting to the idea' do
      existing_user = create_regular_active_user
      create(:reaction, reactable: idea, user: existing_user, mode: 'up')
      other_user = create_regular_active_user

      run_task(n_reactions: 1)

      new_reactions = idea.reactions.where(mode: 'up').where.not(user: existing_user)
      expect(new_reactions.pluck(:user_id)).to eq([other_user.id])
    end

    it 'aborts without creating reactions when there are not enough eligible users' do
      create_regular_active_user # only 1 eligible user

      expect { run_task(n_reactions: 3) }
        .to output(/Not enough eligible users/).to_stdout
        .and(not_change { idea.reactions.count })
    end

    it 'ignores admins and other non-regular users when counting eligible users' do
      create(:admin)
      create(:user, roles: [{ type: 'project_moderator', project_id: SecureRandom.uuid }])

      expect { run_task(n_reactions: 1) }
        .to output(/Not enough eligible users/).to_stdout
        .and(not_change { idea.reactions.count })
    end

    it 'ignores non-active users when counting eligible users' do
      create(:unconfirmed_user) # empty roles but not registered/confirmed => active? == false

      expect { run_task(n_reactions: 1) }
        .to output(/Not enough eligible users/).to_stdout
        .and(not_change { idea.reactions.count })
    end

    it 'aborts when no idea matches the id' do
      expect { run_task(idea_id: SecureRandom.uuid) }.to output(/No idea found/).to_stdout
    end

    context 'when the idea is a proposal' do
      before do
        %w[proposed threshold_reached expired].each { |code| create(:proposals_status, code: code) }
      end

      def create_proposal(reacting_threshold:)
        phase = create(:proposals_phase, reacting_threshold: reacting_threshold)
        create(:proposal, idea_status: IdeaStatus.find_by(code: 'proposed'), creation_phase: phase, project: phase.project)
      end

      it "transitions the proposal to 'threshold_reached' once the reacting_threshold is met" do
        proposal = create_proposal(reacting_threshold: 3)
        3.times { create_regular_active_user }

        run_task(idea_id: proposal.id, n_reactions: 3)

        expect(proposal.reload.idea_status.code).to eq('threshold_reached')
      end

      it "leaves the proposal as 'proposed' when the threshold is not met" do
        proposal = create_proposal(reacting_threshold: 5)
        3.times { create_regular_active_user }

        run_task(idea_id: proposal.id, n_reactions: 3)

        expect(proposal.reload.idea_status.code).to eq('proposed')
      end
    end
  end

  describe 'lifecycle guard' do
    # The default test tenant has lifecycle_stage 'active', and tests run outside the
    # development env, so creation is blocked here.
    it 'refuses to create reactions on a non-demo tenant outside development' do
      create_regular_active_user

      expect { run_task(n_reactions: 1) }
        .to output(/only allowed on demo platforms/).to_stdout
        .and(not_change { idea.reactions.count })
    end
  end

  describe 'argument validation' do
    it 'aborts when no host is given' do
      expect { run_task(host: nil) }.to output(/host, idea_id and n_reactions arguments are all required/).to_stdout
    end

    it 'aborts when no idea_id is given' do
      expect { run_task(idea_id: nil) }.to output(/host, idea_id and n_reactions arguments are all required/).to_stdout
    end

    it 'aborts when n_reactions is zero' do
      expect { run_task(n_reactions: 0) }.to output(/host, idea_id and n_reactions arguments are all required/).to_stdout
    end

    it 'aborts when no tenant matches the host' do
      expect { run_task(host: 'does-not-exist.example.com') }.to output(/No tenant found/).to_stdout
    end
  end
end
# rubocop:enable RSpec/DescribeClass
