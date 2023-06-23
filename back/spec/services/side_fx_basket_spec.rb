# frozen_string_literal: true

require 'rails_helper'

describe SideFxBasketService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  context 'existing basket on a project voting phase' do
    let(:project) { create(:project_with_past_ideation_and_active_budgeting_phase) }
    let(:current_phase) { TimelineService.new.current_phase(project) }
    let(:basket) { create(:basket, participation_context: current_phase, submitted_at: nil) }
    let(:ideas) { create_list(:idea, 2, project: project, phases: project.phases) }

    # TODO: What if the idea has been moved out of the current phase? But is still in the basket for the phase?
    context 'ideas in submitted baskets' do
      it "updates 'baskets_count' for the idea, idea_phase, current_phase and project" do
        basket.update!(ideas: ideas, submitted_at: Time.zone.now)
        service.after_update basket, user
        # binding.pry
        expect(ideas[0].reload.baskets_count).to eq 1
        expect(ideas[1].reload.baskets_count).to eq 1
        expect(ideas[0].ideas_phases[0].reload.baskets_count).to eq 0
        expect(ideas[1].ideas_phases[0].reload.baskets_count).to eq 0
        expect(ideas[0].ideas_phases[1].reload.baskets_count).to eq 1
        expect(ideas[1].ideas_phases[1].reload.baskets_count).to eq 1
        expect(current_phase.reload.baskets_count).to eq 1
        expect(project.reload.baskets_count).to eq 1
      end
    end

    context 'ideas in unsubmitted baskets' do
      it "Does not update 'baskets_count' for the idea, idea_phase, phase and project" do
        basket.update!(ideas: ideas)
        service.after_update basket, user
        expect(ideas[0].reload.baskets_count).to eq 0
        expect(ideas[1].reload.baskets_count).to eq 0
        expect(ideas[0].ideas_phases[0].reload.baskets_count).to eq 0
        expect(ideas[1].ideas_phases[0].reload.baskets_count).to eq 0
        expect(ideas[0].ideas_phases[1].reload.baskets_count).to eq 0
        expect(ideas[1].ideas_phases[1].reload.baskets_count).to eq 0
        expect(current_phase.reload.baskets_count).to eq 0
        expect(project.reload.baskets_count).to eq 0
      end
    end
  end

  context 'existing basket on continuous project' do
    let(:project) { create(:continuous_project) }
    let(:basket) { create(:basket, participation_context: project, submitted_at: nil) }
    let(:ideas) { create_list(:idea, 2, project: project) }

    context 'ideas in submitted baskets' do
      it "updates 'baskets_count' for the idea and project" do
        basket.update!(ideas: ideas, submitted_at: Time.zone.now)
        service.after_update basket, user
        expect(ideas[0].reload.baskets_count).to eq 1
        expect(ideas[1].reload.baskets_count).to eq 1
        expect(project.reload.baskets_count).to eq 1
      end

      it "reduces 'baskets_count' when the basket is unsubmitted" do
        basket.update!(ideas: ideas, submitted_at: Time.zone.now)
        service.after_update basket, user
        expect(ideas[0].reload.baskets_count).to eq 1
        expect(ideas[1].reload.baskets_count).to eq 1
        expect(project.reload.baskets_count).to eq 1

        basket.update!(ideas: ideas, submitted_at: nil)
        service.after_update basket, user
        expect(ideas[0].reload.baskets_count).to eq 0
        expect(ideas[1].reload.baskets_count).to eq 0
        expect(project.reload.baskets_count).to eq 0
      end
    end

    context 'ideas in unsubmitted baskets' do
      it "does not update 'baskets_count' for the idea and project" do
        basket.update!(ideas: ideas)
        service.after_update basket, user
        expect(ideas[0].reload.baskets_count).to eq 0
        expect(ideas[1].reload.baskets_count).to eq 0
        expect(project.reload.baskets_count).to eq 0
      end
    end

  end

  context 'new basket on continuous project' do
    let(:project) { create(:continuous_project) }
    let(:ideas) { create_list(:idea, 2, project: project) }

    context 'ideas in submitted baskets' do
      it "updates 'baskets_count' for the idea and project" do
        basket = create(:basket, participation_context: project, ideas: ideas, submitted_at: Time.zone.now)
        service.after_create basket, user
        expect(ideas[0].reload.baskets_count).to eq 1
        expect(ideas[1].reload.baskets_count).to eq 1
        expect(project.reload.baskets_count).to eq 1
      end
    end

    context 'ideas in unsubmitted baskets' do
      it "does not update 'baskets_count' for the idea and project" do
        basket = create(:basket, participation_context: project, ideas: ideas, submitted_at: nil)
        service.after_create basket, user
        expect(ideas[0].reload.baskets_count).to eq 0
        expect(ideas[1].reload.baskets_count).to eq 0
        expect(project.reload.baskets_count).to eq 0
      end
    end
  end
end
