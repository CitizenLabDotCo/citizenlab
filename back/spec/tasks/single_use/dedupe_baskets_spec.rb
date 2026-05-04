# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:dedupe_baskets rake task' do
  before { load_rake_tasks_if_not_loaded }
  after { Rake::Task['single_use:dedupe_baskets'].reenable }

  def run_task(execute: false)
    Rake::Task['single_use:dedupe_baskets'].invoke(execute ? 'execute' : nil)
  end

  let(:phase) { create(:single_phase_budgeting_project).phases.first }
  let(:phase2) { create(:single_phase_budgeting_project).phases.first }
  let(:user) { create(:user) }

  describe 'dry-run mode' do
    context 'when the task is run in dry-run mode' do
      it 'does not modify any baskets' do
        submitted_basket1 = create(:basket, user: user, phase: phase)
        submitted_basket2 = create(:basket, user: user, phase: phase)
        draft_basket1 = create(:basket, user: user, phase: phase, submitted_at: nil)
        draft_basket2 = create(:basket, user: user, phase: phase, submitted_at: nil)

        run_task(execute: false)

        expect(submitted_basket1.reload.user_id).to eq(user.id)
        expect(submitted_basket2.reload.user_id).to eq(user.id)
        expect(draft_basket1.reload.user_id).to eq(user.id)
        expect(draft_basket2.reload.user_id).to eq(user.id)
      end
    end
  end

  describe 'execute mode' do
    context 'when a user has one submitted basket and one or more drafts in the same phase' do
      it 'keeps the submitted basket and detaches the drafts' do
        submitted_basket = create(:basket, user: user, phase: phase)
        draft_basket1 = create(:basket, user: user, phase: phase, submitted_at: nil)
        draft_basket2 = create(:basket, user: user, phase: phase, submitted_at: nil)

        run_task(execute: true)

        expect(submitted_basket.reload.user_id).to eq(user.id)
        expect(draft_basket1.reload.user_id).to be_nil
        expect(draft_basket2.reload.user_id).to be_nil
      end
    end

    context 'when a user has multiple submitted baskets in the same phase' do
      it 'keeps the earliest submitted basket and detaches the others' do
        submitted_basket1 = create(:basket, user: user, phase: phase, submitted_at: 2.days.ago)
        submitted_basket2 = create(:basket, user: user, phase: phase, submitted_at: 1.day.ago)

        run_task(execute: true)

        expect(submitted_basket1.reload.user_id).to eq(user.id)
        expect(submitted_basket2.reload.user_id).to be_nil
      end
    end

    context 'when a user has only draft baskets in the same phase' do
      it 'keeps the most recently updated draft and detaches the others' do
        draft_basket1 = create(:basket, user: user, phase: phase, submitted_at: nil)
        draft_basket2 = create(:basket, user: user, phase: phase, submitted_at: nil)
        # Rails auto-updates `updated_at` on save, so use update_columns to bypass that
        draft_basket1.update_columns(updated_at: 2.days.ago)
        draft_basket2.update_columns(updated_at: 1.day.ago)

        run_task(execute: true)

        expect(draft_basket1.reload.user_id).to be_nil
        expect(draft_basket2.reload.user_id).to eq(user.id)
      end
    end

    context 'when a user has multiple submitted baskets and multiple drafts in the same phase' do
      it 'applies the selection policy correctly' do
        submitted_basket1 = create(:basket, user: user, phase: phase, submitted_at: 3.days.ago)
        submitted_basket2 = create(:basket, user: user, phase: phase, submitted_at: 2.days.ago)
        draft_basket1 = create(:basket, user: user, phase: phase, submitted_at: nil)
        draft_basket2 = create(:basket, user: user, phase: phase, submitted_at: nil)

        run_task(execute: true)

        expect(submitted_basket1.reload.user_id).to eq(user.id)
        expect(submitted_basket2.reload.user_id).to be_nil
        expect(draft_basket1.reload.user_id).to be_nil
        expect(draft_basket2.reload.user_id).to be_nil
      end
    end

    context 'when a user has only one basket in a phase' do
      it 'does not modify the basket' do
        basket = create(:basket, user: user, phase: phase)

        run_task(execute: true)

        expect(basket.reload.user_id).to eq(user.id)
      end
    end

    context 'when a user has duplicate baskets across different phases' do
      it 'deduplicates within each (user, phase) pair independently' do
        submitted_basket_phase1 = create(:basket, user: user, phase: phase)
        draft_basket_phase1 = create(:basket, user: user, phase: phase, submitted_at: nil)
        submitted_basket_phase2 = create(:basket, user: user, phase: phase2)
        draft_basket_phase2 = create(:basket, user: user, phase: phase2, submitted_at: nil)

        run_task(execute: true)

        expect(submitted_basket_phase1.reload.user_id).to eq(user.id)
        expect(draft_basket_phase1.reload.user_id).to be_nil
        expect(submitted_basket_phase2.reload.user_id).to eq(user.id)
        expect(draft_basket_phase2.reload.user_id).to be_nil
      end
    end

    context 'when basket.update fails for an orphan' do
      let!(:draft_basket) { create(:basket, user: user, phase: phase, submitted_at: nil) }

      before do
        create(:basket, user: user, phase: phase) # keeper, makes the draft a duplicate
        # Simulate a validation/save failure on the detach update
        allow_any_instance_of(Basket).to receive(:update).with(user_id: nil).and_return(false)
      end

      it 'leaves the failed orphan attached' do
        run_task(execute: true)

        expect(draft_basket.reload.user_id).to eq(user.id)
      end

      it 'logs an error to stdout' do
        expect { run_task(execute: true) }.to output(/ERROR! Failed to detach basket/).to_stdout
      end
    end
  end
end
# rubocop:enable RSpec/DescribeClass
