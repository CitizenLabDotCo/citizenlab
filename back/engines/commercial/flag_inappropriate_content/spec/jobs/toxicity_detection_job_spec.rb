# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ToxicityDetectionJob do
  let(:service) do
    stub_toxicity_detection!(FlagInappropriateContent::ToxicityDetectionService.new)
  end
  let!(:idea_proposed_status) { create(:idea_status_proposed) }
  let!(:idea_prescreening_status) { create(:idea_status_prescreening) }
  let!(:proposal_proposed_status) { create(:proposals_status, :proposed) }
  let!(:proposal_prescreening_status) { create(:proposal_status_prescreening) }

  def stub_toxicity_detection!(service)
    allow(service).to receive(:classify_toxicity) do |text|
      is_toxic = text.downcase.include?('offensive')
      { toxicity_label: 'insult', ai_reason: 'Insulting content detected.' } if is_toxic
    end

    service
  end

  before_all do
    SettingsService.new.activate_feature!('moderation')
    SettingsService.new.activate_feature!('flag_inappropriate_content')
    SettingsService.new.activate_feature!('prescreening')
    SettingsService.new.activate_feature!('prescreening_ideation')
  end

  before do
    allow(FlagInappropriateContent::ToxicityDetectionService)
      .to receive(:new)
      .and_return(service)
  end

  describe 'prescreening_mode: flagged_only' do
    context 'with ideation' do
      let(:phase) { create(:phase, prescreening_mode: 'flagged_only') }

      it 'publishes non-flagged idea in prescreening' do
        idea = create(
          :idea, phases: [phase], title_multiloc: { 'en' => 'innocent idea' },
          idea_status: idea_prescreening_status, publication_status: 'submitted'
        )

        expect { described_class.perform_now(idea, attributes: [:title_multiloc]) }
          .to change(idea, :idea_status).from(idea_prescreening_status).to(idea_proposed_status)
          .and change(idea, :publication_status).from('submitted').to('published')
      end

      it 'keeps flagged idea in prescreening' do
        idea = create(
          :idea, phases: [phase], title_multiloc: { 'en' => 'offensive idea' },
          idea_status: idea_prescreening_status, publication_status: 'submitted'
        )

        expect { described_class.perform_now(idea, attributes: [:title_multiloc]) }
          .to not_change(idea, :publication_status)
          .and not_change(idea, :idea_status)
      end

      it 'keeps non-flagged published idea unchanged' do
        idea = create(
          :idea, phases: [phase], title_multiloc: { 'en' => 'innocent idea' },
          idea_status: idea_proposed_status, publication_status: 'published'
        )

        expect { described_class.perform_now(idea, attributes: [:title_multiloc]) }
          .to not_change(idea, :publication_status)
          .and not_change(idea, :idea_status)
      end

      it 'moves flagged published idea to prescreening' do
        idea = create(
          :idea, phases: [phase], title_multiloc: { 'en' => 'offensive idea' },
          idea_status: idea_proposed_status, publication_status: 'published'
        )

        expect { described_class.perform_now(idea, attributes: [:title_multiloc]) }
          .to change(idea, :idea_status).from(idea_proposed_status).to(idea_prescreening_status)
          .and change(idea, :publication_status).from('published').to('submitted')
      end
    end

    context 'with proposals' do
      let(:phase) { create(:proposals_phase, prescreening_mode: 'flagged_only') }
      let(:project) { phase.project }

      it 'publishes non-flagged proposal in prescreening' do
        proposal = create(
          :proposal, creation_phase: phase, project:,
          title_multiloc: { 'en' => 'innocent proposal' },
          idea_status: proposal_prescreening_status, publication_status: 'submitted'
        )

        expect { described_class.perform_now(proposal, attributes: [:title_multiloc]) }
          .to change(proposal, :idea_status).from(proposal_prescreening_status).to(proposal_proposed_status)
          .and change(proposal, :publication_status).from('submitted').to('published')
      end

      it 'keeps flagged proposal in prescreening' do
        proposal = create(
          :proposal, creation_phase: phase, project:,
          title_multiloc: { 'en' => 'offensive proposal' },
          idea_status: proposal_prescreening_status, publication_status: 'submitted'
        )

        expect { described_class.perform_now(proposal, attributes: [:title_multiloc]) }
          .to not_change(proposal, :publication_status)
          .and not_change(proposal, :idea_status)
      end

      it 'keeps non-flagged published proposal unchanged' do
        proposal = create(
          :proposal, creation_phase: phase, project:,
          title_multiloc: { 'en' => 'innocent proposal' },
          idea_status: proposal_proposed_status, publication_status: 'published'
        )

        expect { described_class.perform_now(proposal, attributes: [:title_multiloc]) }
          .to not_change(proposal, :publication_status)
          .and not_change(proposal, :idea_status)
      end

      it 'moves flagged published proposal to prescreening' do
        proposal = create(
          :proposal, creation_phase: phase, project:,
          title_multiloc: { 'en' => 'offensive proposal' },
          idea_status: proposal_proposed_status, publication_status: 'published'
        )

        expect { described_class.perform_now(proposal, attributes: [:title_multiloc]) }
          .to change(proposal, :idea_status).from(proposal_proposed_status).to(proposal_prescreening_status)
          .and change(proposal, :publication_status).from('published').to('submitted')
      end
    end
  end

  describe 'prescreening_mode: all' do
    it 'creates flag but does not change status' do
      phase = create(:proposals_phase, prescreening_mode: 'all')
      proposal = create(
        :proposal, creation_phase: phase, project: phase.project,
        title_multiloc: { 'en' => 'offensive proposal' },
        idea_status: proposal_proposed_status, publication_status: 'published'
      )

      expect { described_class.perform_now(proposal, attributes: [:title_multiloc]) }
        .to not_change(proposal, :idea_status)

      expect(proposal.reload.inappropriate_content_flag).to be_present
    end
  end

  describe 'prescreening_mode: nil (disabled)' do
    it 'creates flag but does not change status' do
      phase = create(:proposals_phase, prescreening_mode: nil)
      proposal = create(
        :proposal, creation_phase: phase, project: phase.project,
        title_multiloc: { 'en' => 'offensive proposal' },
        idea_status: proposal_proposed_status
      )

      expect { described_class.perform_now(proposal, attributes: [:title_multiloc]) }
        .to not_change(proposal, :idea_status)

      expect(proposal.reload.inappropriate_content_flag).to be_present
    end
  end

  describe 'with comments' do
    it 'creates flag for flagged comment' do
      comment = create(:comment, body_multiloc: { 'en' => 'offensive comment' })

      described_class.perform_now(comment, attributes: [:body_multiloc])

      expect(comment.reload.inappropriate_content_flag).to be_present
    end
  end
end
