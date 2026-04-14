# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProcessScheduledPublicationTransitionsJob do
  subject(:job) { described_class.new }

  let(:user) { create(:admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
  let(:admin_publication) { project.admin_publication }

  describe '#run' do
    context 'happy path' do
      before do
        admin_publication.update_columns(
          scheduled_status: 'published', scheduled_at: 1.hour.ago, scheduled_by_id: user.id
        )
      end

      it 'materializes the transition and clears scheduled fields' do
        job.run
        admin_publication.reload

        expect(admin_publication.read_attribute(:publication_status)).to eq('published')
        expect(admin_publication.scheduled_status).to be_nil
        expect(admin_publication.scheduled_at).to be_nil
        expect(admin_publication.scheduled_by_id).to be_nil
      end

      it 'sets first_published_at when publishing for the first time' do
        admin_publication.update_columns(first_published_at: nil)
        job.run
        admin_publication.reload

        expect(admin_publication.first_published_at).to be_present
      end

      it 'fires side effects via SideFxProjectService' do
        expect { job.run }
          .to have_enqueued_job(LogActivityJob)
          .with(project, 'changed', user, anything, anything)
      end
    end

    context 'draft to published' do
      let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

      before do
        admin_publication.update_columns(
          scheduled_status: 'published', scheduled_at: 1.hour.ago, scheduled_by_id: user.id
        )
        admin_publication.reload
      end

      it 'fires the published activity' do
        expect { job.run }
          .to have_enqueued_job(LogActivityJob)
          .with(project, 'published', user, anything, anything)
      end
    end

    context 'archived to published' do
      before do
        admin_publication.update_columns(
          publication_status: 'archived', scheduled_status: 'published',
          scheduled_at: 1.hour.ago, first_published_at: 1.day.ago, scheduled_by_id: user.id
        )
        admin_publication.reload
      end

      it 'does not fire the published activity' do
        job.run
        expect(LogActivityJob).not_to have_been_enqueued.with(project, 'published', anything, anything)
      end
    end

    context 'when scheduled_at is in the future' do
      before do
        admin_publication.update_columns(scheduled_status: 'published', scheduled_at: 2.hours.from_now)
      end

      it 'does nothing' do
        job.run
        admin_publication.reload

        expect(admin_publication.scheduled_status).to eq('published')
        expect(admin_publication.read_attribute(:publication_status)).to eq('draft')
      end
    end

    context 'already at target status' do
      before do
        admin_publication.update_columns(
          publication_status: 'published', scheduled_status: 'published', scheduled_at: 1.hour.ago
        )
      end

      it 'clears scheduled fields without firing additional side effects' do
        ActiveJob::Base.queue_adapter.enqueued_jobs.clear

        job.run
        admin_publication.reload

        expect(admin_publication.scheduled_status).to be_nil
        expect(admin_publication.scheduled_at).to be_nil
        expect(LogActivityJob).not_to have_been_enqueued
      end
    end

    it 'processes multiple due transitions' do
      project2 = create(:project, admin_publication_attributes: { publication_status: 'draft' })
      admin_publication.update_columns(
        scheduled_status: 'archived', scheduled_at: 1.hour.ago, scheduled_by_id: user.id
      )
      project2.admin_publication.update_columns(
        scheduled_status: 'archived', scheduled_at: 30.minutes.ago, scheduled_by_id: user.id
      )

      job.run

      expect(admin_publication.reload.read_attribute(:publication_status)).to eq('archived')
      expect(project2.admin_publication.reload.read_attribute(:publication_status)).to eq('archived')
    end
  end
end
