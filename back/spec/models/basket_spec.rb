# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Basket do
  it_behaves_like 'location_trackable_participation'

  context 'Default factory' do
    it 'is valid' do
      expect(build(:basket)).to be_valid
    end
  end

  context 'baskets_ideas' do
    it 'preserve created_at upon update' do
      basket = create(:basket)
      t1 = Time.now - 20.minutes
      i1 = create(:idea)
      travel_to t1 do
        basket.update!(ideas: [i1])
      end
      t2 = Time.now
      i2 = create(:idea)
      travel_to t2 do
        basket.update!(ideas: [i1, i2])
      end
      expect(basket.baskets_ideas.pluck(:created_at).map(&:to_i)).to match_array [t1, t2].map(&:to_i)
    end
  end

  context 'when a basket has more than the maximum votes' do
    before do
      project = create(:single_phase_budgeting_project, phase_attrs: { voting_max_total: 1000 })
      ideas = create_list(:idea, 11, budget: 100, project: project)
      @basket = create(:basket, ideas: ideas, phase: project.phases.first)
      @basket.baskets_ideas.update_all(votes: 100)
    end

    it 'is valid in normal context' do
      @basket.submitted_at = Time.now
      expect(@basket).to be_valid
    end

    it 'is not valid in submission context' do
      @basket.submitted_at = Time.now
      expect(@basket.save(context: :basket_submission)).to be(false)
      expect(@basket.errors.details).to eq({ total_votes: [{ error: :less_than_or_equal_to, value: 1100, count: 1000 }] })
      expect(@basket.errors.messages).to eq({ total_votes: ['must be less than or equal to 1000'] })
    end
  end

  context 'when a basket has less than the minimum votes' do
    let(:project) { create(:single_phase_budgeting_project, phase_attrs: { voting_min_total: 5 }) }
    let(:basket) { create(:basket, ideas: [idea], phase: project.phases.first, submitted_at: Time.now) }
    let(:idea) { create(:idea, budget: 1, project: project) }

    it 'is valid in normal context' do
      basket.submitted_at = Time.now
      expect(basket).to be_valid
    end

    it 'is not valid in submission context' do
      basket.submitted_at = Time.now
      expect(basket.save(context: :basket_submission)).to be(false)
      expect(basket.errors.details).to eq({ total_votes: [{ error: :greater_than_or_equal_to, value: 1, count: 5 }] })
      expect(basket.errors.messages).to eq({ total_votes: ['must be greater than or equal to 5'] })
    end
  end

  context 'when an idea has more than the maximum votes per idea' do
    let(:basket) { create(:basket, phase: phase, submitted_at: Time.now) }
    let!(:baskets_idea) { create(:baskets_idea, basket: basket, idea: idea, votes: 4) }
    let(:phase) { create(:multiple_voting_phase, voting_max_votes_per_idea: 3) }
    let(:idea) { create(:idea, project: phase.project, phases: [phase]) }

    it 'is valid in normal context' do
      basket.submitted_at = Time.now
      expect(basket).to be_valid
    end

    it 'is not valid in submission context' do
      basket.submitted_at = Time.now
      expect(basket.save(context: :basket_submission)).to be false
      expect(basket.errors.details).to eq({ baskets_ideas: [{ error: :less_than_or_equal_to, value: 4, count: 3, idea_id: idea.id }] })
      expect(basket.errors.messages).to eq({ baskets_ideas: ['must be less than or equal to 3'] })
    end
  end

  context "when the basket's project is updated to non-budgeting participation method" do
    let(:project) { create(:single_phase_budgeting_project, phase_attrs: { voting_min_total: 200 }) }
    let!(:basket) { create(:basket, ideas: [idea], phase: project.phases.first, submitted_at: Time.now) }
    let(:idea) { create(:idea, budget: 100, project: project, phases: project.phases) }

    # Check the basket remains valid and thus won't fail data consistency checks, as would be the case,
    # for example, if we enforce validation that the phase is budgeting.
    it 'the basket remains valid' do
      project.phases.first.update!(participation_method: 'ideation')
      basket.reload
      expect(basket).to be_valid
    end
  end

  context 'budgeting' do
    let(:project) { create(:single_phase_budgeting_project) }
    let(:idea) { create(:idea, project: project, budget: 5) }
    let(:basket) { create(:basket, phase: project.phases.first, ideas: (create_list(:idea, 2, project: project, budget: 10) + [idea])) }

    context 'when deleting an idea with budget' do
      it 'the idea is removed from all baskets and the total votes is changed' do
        expect(basket.ideas.count).to eq 3
        expect(basket.total_votes).to eq 25
        idea.destroy!
        basket.reload
        expect(basket.ideas.pluck(:id)).not_to include idea.id
        expect(basket.ideas.count).to eq 2
        expect(basket.total_votes).to eq 20
      end
    end

    context 'when editing the budget of an idea' do
      it 'the total votes of existing baskets is not changed' do
        expect(basket.total_votes).to eq 25
        idea.update!(budget: 7)
        basket.reload
        expect(basket.total_votes).to eq 25
      end
    end
  end

  context 'when deleting a user' do
    let(:user) { create(:user) }
    let(:basket) { create(:basket, user: user) }

    context 'when a basket has been submitted' do
      before { basket.update!(submitted_at: Time.now) }

      it 'deletes the basket if the voting phase is not finished' do
        basket.update!(phase: create(:budgeting_phase, end_at: Time.now + 7.days))
        user.destroy!
        expect { basket.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'keeps the basket if the voting phase has finished' do
        basket.update!(phase: create(:budgeting_phase, end_at: Time.now - 7.days))
        user.destroy!
        expect { basket.reload }.not_to raise_error
        expect(basket.reload.user).to be_nil
      end
    end

    context 'when a basket is not submitted' do
      before { basket.update!(submitted_at: nil) }

      it 'deletes the basket if the voting phase is not finished' do
        basket.update!(phase: create(:budgeting_phase, end_at: Time.now + 7.days))
        user.destroy!
        expect { basket.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'deletes the basket if the voting phase has finished' do
        basket.update!(phase: create(:budgeting_phase, end_at: Time.now - 7.days))
        user.destroy!
        expect { basket.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#update_counts' do
    context 'existing basket on a project voting phase' do
      let(:project) { create(:project_with_past_ideation_and_active_budgeting_phase) }
      let(:current_phase) { TimelineService.new.current_phase(project) }
      let(:basket) { create(:basket, phase: current_phase, submitted_at: nil) }
      let(:ideas) { create_list(:idea, 2, project: project, phases: project.phases) }

      context 'ideas in submitted baskets' do
        before do
          basket.update!(ideas: ideas, submitted_at: Time.zone.now)
          basket.baskets_ideas.update_all(votes: 10)
          basket.update_counts!
        end

        it "updates 'baskets_count' & 'votes_count' for the idea, idea_phase, current_phase and project" do
          expect(ideas[0].reload.baskets_count).to eq 1
          expect(ideas[1].reload.baskets_count).to eq 1
          expect(ideas[0].reload.votes_count).to eq 10
          expect(ideas[1].reload.votes_count).to eq 10
          expect(ideas[0].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[1].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[0].ideas_phases[1].reload.baskets_count).to eq 1
          expect(ideas[1].ideas_phases[1].reload.baskets_count).to eq 1
          expect(ideas[0].ideas_phases[1].reload.votes_count).to eq 10
          expect(ideas[1].ideas_phases[1].reload.votes_count).to eq 10
          expect(current_phase.reload.baskets_count).to eq 1
          expect(current_phase.reload.votes_count).to eq 20
          expect(project.reload.votes_count).to eq 20
        end

        it "reduces the 'baskets_count' and 'votes_count' when the basket is deleted" do
          basket.destroy!
          basket.update_counts!

          expect(ideas[0].reload.baskets_count).to eq 0
          expect(ideas[1].reload.baskets_count).to eq 0
          expect(ideas[0].reload.votes_count).to eq 0
          expect(ideas[1].reload.votes_count).to eq 0
          expect(ideas[0].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[1].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[0].ideas_phases[1].reload.baskets_count).to eq 0
          expect(ideas[1].ideas_phases[1].reload.baskets_count).to eq 0
          expect(ideas[0].ideas_phases[1].reload.votes_count).to eq 0
          expect(ideas[1].ideas_phases[1].reload.votes_count).to eq 0
          expect(current_phase.reload.baskets_count).to eq 0
          expect(project.reload.baskets_count).to eq 0
        end
      end

      context 'ideas in unsubmitted baskets' do
        it "Does not update 'baskets_count' or 'votes_count' for the idea, idea_phase, phase and project" do
          basket.update!(ideas: ideas)
          basket.update_counts!
          expect(ideas[0].reload.baskets_count).to eq 0
          expect(ideas[1].reload.baskets_count).to eq 0
          expect(ideas[0].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[1].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[0].ideas_phases[1].reload.baskets_count).to eq 0
          expect(ideas[1].ideas_phases[1].reload.baskets_count).to eq 0
          expect(current_phase.reload.baskets_count).to eq 0
          expect(current_phase.reload.votes_count).to eq 0
          expect(project.reload.baskets_count).to eq 0
          expect(project.reload.votes_count).to eq 0
        end
      end
    end

    context 'new basket on open ended project' do
      let(:project) { create(:single_phase_budgeting_project) }
      let(:ideas) { create_list(:idea, 2, project: project, phases: project.phases) }
      let(:current_phase) { TimelineService.new.current_phase(project) }

      context 'ideas in submitted baskets' do
        it "updates 'baskets_count' and 'votes_count' for the idea, idea_phase, current_phase and project" do
          basket = create(:basket, phase: project.phases.first, ideas: ideas, submitted_at: Time.zone.now)
          basket.baskets_ideas.update_all(votes: 4)
          basket.update_counts!
          expect(ideas[0].reload.baskets_count).to eq 1
          expect(ideas[1].reload.baskets_count).to eq 1
          expect(ideas[0].reload.votes_count).to eq 4
          expect(ideas[1].reload.votes_count).to eq 4
          expect(ideas[0].ideas_phases[0].reload.baskets_count).to eq 1
          expect(ideas[1].ideas_phases[0].reload.baskets_count).to eq 1
          expect(ideas[0].ideas_phases[0].reload.votes_count).to eq 4
          expect(ideas[1].ideas_phases[0].reload.votes_count).to eq 4
          expect(current_phase.reload.baskets_count).to eq 1
          expect(current_phase.reload.votes_count).to eq 8
          expect(project.reload.baskets_count).to eq 1
          expect(project.reload.votes_count).to eq 8
        end
      end

      context 'ideas in unsubmitted baskets' do
        it "does not update 'baskets_count' or 'votes_count' for the idea, idea_phase, current_phase and project" do
          basket = create(:basket, phase: project.phases.first, ideas: ideas, submitted_at: nil)
          basket.update_counts!
          expect(ideas[0].reload.baskets_count).to eq 0
          expect(ideas[1].reload.baskets_count).to eq 0
          expect(ideas[0].reload.votes_count).to eq 0
          expect(ideas[1].reload.votes_count).to eq 0
          expect(ideas[0].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[1].ideas_phases[0].reload.baskets_count).to eq 0
          expect(ideas[0].ideas_phases[0].reload.votes_count).to eq 0
          expect(ideas[1].ideas_phases[0].reload.votes_count).to eq 0
          expect(current_phase.reload.baskets_count).to eq 0
          expect(current_phase.reload.votes_count).to eq 0
          expect(project.reload.baskets_count).to eq 0
          expect(project.reload.votes_count).to eq 0
        end
      end
    end
  end
end
