# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Basket do
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
        basket.update(ideas: [i1])
      end
      t2 = Time.now
      i2 = create(:idea)
      travel_to t2 do
        basket.update(ideas: [i1, i2])
      end
      expect(basket.baskets_ideas.pluck(:created_at).map(&:to_i)).to match_array [t1, t2].map(&:to_i)
    end
  end

  context 'when a basket exceeding the maximum budget' do
    before do
      project = create(:continuous_budgeting_project, max_budget: 1000)
      ideas = create_list(:idea, 11, budget: 100, project: project)
      @basket = create(:basket, ideas: ideas, participation_context: project)
    end

    it 'is valid in normal context' do
      @basket.submitted_at = Time.now
      expect(@basket).to be_valid
    end

    it 'is not valid in submission context' do
      @basket.submitted_at = Time.now
      expect(@basket.save(context: :basket_submission)).to be(false)
    end
  end

  context 'when a basket less than the minimum budget' do
    let(:basket) { create(:basket, ideas: [idea], participation_context: project, submitted_at: Time.now) }
    let(:project) { create(:continuous_budgeting_project, min_budget: 200) }
    let(:idea) { create(:idea, budget: 100, project: project) }

    it 'is valid in normal context' do
      expect(basket).to be_valid
    end

    it 'is not valid in submission context' do
      expect(basket.save(context: :basket_submission)).to be(false)
      expect(basket.errors.details).to eq(
        ideas: [error: :less_than_min_budget]
      )
    end
  end

  context 'when an idea without a budget' do
    before do
      @idea = create(:idea, budget: nil)
    end

    it 'cannot be added to a basket' do
      basket = create(:basket)
      basket_idea = build(:baskets_idea, basket: basket, idea: @idea)
      expect(basket_idea).to be_invalid
    end
  end

  context "when the basket's project is updated to non-budgeting participation method" do
    let!(:basket) { create(:basket, ideas: [idea], participation_context: project, submitted_at: Time.now) }
    let(:project) { create(:continuous_budgeting_project, min_budget: 200) }
    let(:idea) { create(:idea, budget: 100, project: project) }

    # Check the basket remains valid and thus won't fail data consistency checks, as would be the case,
    # for example, if we enforce validation that the participation_context is budgeting.
    it 'the basket remains valid' do
      project.update!(participation_method: 'ideation')
      basket.reload
      expect(basket).to be_valid
    end
  end
end
