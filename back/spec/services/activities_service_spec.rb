# frozen_string_literal: true

require 'rails_helper'

describe ActivitiesService do
  let(:service) { described_class.new }

  describe '#create_periodic_activities' do
    describe '#create_phase_started_activities' do
      let_it_be(:phase) { create(:phase) }

      it 'logs phase started activity when a new phase starts' do
        now = phase.start_at + 1.minute

        expect { service.create_periodic_activities(now: now) }
          .to have_enqueued_job(LogActivityJob)
          .with(phase, 'started', nil, phase.start_at, project_id: phase.project_id)
      end

      it "doesn't log phase started activity when no new phase starts" do
        now = phase.start_at - 1.minute

        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
          .with(phase, 'started', anything, anything, anything)
      end

      it "doesn't log a new activity if there's already one for the same phase" do
        now = phase.start_at + 1.minute

        Activity.create(item: phase, action: 'started', acted_at: phase.start_at)

        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
          .with(phase, 'started', anything, anything, anything)
      end
    end

    describe '#create_phase_upcoming_activities' do
      let_it_be(:phase) { create(:phase) }

      it 'logs phase upcoming activity when a new phase starts within a week' do
        now = phase.start_at - 7.days

        expect { service.create_periodic_activities(now: now) }
          .to have_enqueued_job(LogActivityJob)
          .with(phase, 'upcoming', nil, now, project_id: phase.project_id)
      end

      it "doesn't log phase upcoming activity when phase starts more than a week from now" do
        now = phase.start_at - 7.days - 1.second

        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
          .with(phase, 'upcoming', anything, anything, anything)
      end

      it "doesn't log a new upcoming-phase activity if there's already one for the same phase" do
        now = phase.start_at - 4.days

        # acted_at doesn't matter for this test
        Activity.create(item: phase, action: 'upcoming', acted_at: Time.now)

        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
          .with(phase, 'upcoming', anything, anything, anything)
      end
    end

    describe '#create_invite_not_accepted_since_3_days_activities' do
      it 'logs invite not accepted since 3 days activity when an invite was not accepted since (in the application timezone)' do
        created_at = Time.parse '2019-03-22 10:50:00 +0000'
        invite = create(:invite, created_at: created_at)
        now = created_at + 3.days

        expect { service.create_periodic_activities(now: now) }
          .to have_enqueued_job(LogActivityJob).with(invite, 'not_accepted_since_3_days', nil, now)
      end

      it "doesn't log accepted since 3 days activity when no invite wasn't accepted since (in the application timezone)" do
        created_at = Time.parse '2019-03-22 10:50:00 +0000'
        invite = create(:invite, created_at: created_at)
        now = Time.parse '2019-03-25 10:50:00 +1200'

        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob).with(invite, 'not_accepted_since_3_days', nil, now)
      end
    end

    describe '#create_phase_ending_soon_activities' do
      let(:now) { Time.parse '2022-07-01 08:01:00 +0200' }

      it 'logs phase ending soon activity after 8am when a phase is ending in the next 2 days' do
        phase = create(:budgeting_phase, start_at: now - 10.days, end_at: now + 2.days)
        expect { service.create_periodic_activities(now: now) }
          .to have_enqueued_job(LogActivityJob)
          .with(phase, 'ending_soon', nil, now, project_id: phase.project_id)
      end

      it 'does not log a phase ending_soon activity when one has already been logged' do
        phase = create(:budgeting_phase, start_at: now - 10.days, end_at: now + 2.days)
        create(:activity, item: phase, action: 'ending_soon')
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log a phase ending_soon activity when the phase ends in more than 2 days' do
        create(:budgeting_phase, start_at: now - 10.days, end_at: now + 3.days)
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log a phase ending soon activity before 8am when a phase is ending in the next 2 days' do
        now = Time.parse('2022-07-01 07:59:00 +0200')
        create(:budgeting_phase, start_at: now - 10.days, end_at: now + 2.days)
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log a phase ending_soon activity when the phase has no end date' do
        create(:budgeting_phase, start_at: now - 10.days, end_at: nil)
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end
    end

    describe '#create_basket_not_submitted_activities' do
      let(:updated_at) { Time.parse '2022-07-01 10:00:00 +0000' }
      let!(:basket) { create(:basket, submitted_at: nil) }

      it 'logs basket not submitted activity when a basket has not been submitted and the last item in the basket was updated over 1 day ago' do
        create(:baskets_idea, idea: create(:idea), basket: basket, created_at: updated_at, updated_at: updated_at)
        now = updated_at + 1.day
        expect { service.create_periodic_activities(now: now) }
          .to have_enqueued_job(LogActivityJob)
          .with(basket, 'not_submitted', nil, now, project_id: basket.phase.project.id)
      end

      it 'does not log activity when a basket not_submitted activity is already created' do
        create(:baskets_idea, idea: create(:idea), basket: basket, created_at: updated_at, updated_at: updated_at)
        create(:activity, item: basket, action: 'not_submitted')
        now = updated_at + 1.day
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log an activity when a basket has been updated less than 1 day ago' do
        create(:baskets_idea, idea: create(:idea), basket: basket, created_at: updated_at, updated_at: updated_at)
        now = updated_at + 5.hours
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log an activity when a basket has no ideas' do
        now = updated_at + 1.day
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log an activity when a the voting phase finished' do
        create(:activity, item: basket.phase, action: 'ended')
        create(:baskets_idea, idea: create(:idea), basket: basket, created_at: updated_at, updated_at: updated_at)
        now = updated_at + 1.day
        basket.phase.update!(start_at: (now - 4.days), end_at: (now - 2.days))
        expect { service.create_periodic_activities(now: now) }
          .not_to(have_enqueued_job(LogActivityJob))
      end
    end

    describe '#create_survey_not_submitted_activities' do
      let(:updated_at) { Time.parse '2022-07-01 10:00:00 +0000' }
      let!(:idea) { create(:native_survey_response, publication_status: 'draft').tap { |input| input.update!(updated_at: updated_at) } }

      before { create(:idea_status_proposed) }

      it 'logs survey_not_submitted activity when a native survey response is in draft but was last updated over 1 day ago' do
        now = updated_at + 1.day
        expect { service.create_periodic_activities(now: now) }
          .to have_enqueued_job(LogActivityJob)
          .with(idea, 'survey_not_submitted', nil, now, project_id: idea.project.id)
      end

      it 'does not log activity when a survey_not_submitted activity is already created' do
        create(:activity, item: idea, action: 'survey_not_submitted')
        now = updated_at + 1.day
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log an activity when a survey has been updated less than 1 day ago' do
        now = updated_at + 5.hours
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end

      it 'does not log an activity when a the survey phase finished' do
        create(:activity, item: idea.creation_phase, action: 'ended')
        now = updated_at + 1.day
        idea.creation_phase.update!(start_at: (now - 4.days), end_at: (now - 2.days))
        expect { service.create_periodic_activities(now: now) }
          .not_to(have_enqueued_job(LogActivityJob))
      end

      it 'does not log an activity when an author has already submitted a survey for this phase' do
        create(
          :native_survey_response,
          author: idea.author,
          project: idea.project,
          creation_phase: idea.creation_phase,
          publication_status: 'published'
        )
        now = updated_at + 1.day
        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
      end
    end

    describe '#create_phase_ended_activities' do
      let_it_be(:phase) { create(:budgeting_phase) }
      let(:now) { Time.parse '2022-07-01 10:00:00 +0000' }

      it 'logs phase ended activity when a phase has ended (end_at <= now)' do
        now = phase.end_at

        expect { service.create_periodic_activities(now: now) }
          .to have_enqueued_job(LogActivityJob)
          .with(phase, 'ended', nil, now, project_id: phase.project_id)
      end

      it 'does not log a phase ended activity when one has already been logged' do
        create(:activity, item: phase, action: 'ended')
        now = phase.end_at + 1.second

        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
          .with(phase, 'ended', anything, anything, anything)
      end

      it 'does not log a phase ended activity when the phase has not ended' do
        now = phase.start_at + ((phase.end_at - phase.start_at) / 2) # halfway through the phase

        expect { service.create_periodic_activities(now: now) }
          .not_to have_enqueued_job(LogActivityJob)
          .with(phase, 'ended', anything, anything, anything)
      end
    end
  end
end
