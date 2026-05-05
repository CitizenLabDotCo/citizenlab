# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProcessScheduledPublicationTransitionsJob do
  subject(:job) { described_class.new }

  context 'for a single admin publication' do
    let_it_be(:user) { create(:admin) }
    let_it_be(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let_it_be(:admin_publication, reload: true) { project.admin_publication }

    context 'when publishing transition is due' do
      before_all do
        admin_publication.update_columns(
          scheduled_status: 'published',
          scheduled_at: 1.hour.ago,
          scheduled_by_id: user.id
        )
      end

      it 'materializes the transition and clears scheduled fields' do
        described_class.perform_now(admin_publication)

        admin_publication.reload
        expect(admin_publication.read_attribute(:publication_status)).to eq('published')
        expect(admin_publication.scheduled_status).to be_nil
        expect(admin_publication.scheduled_at).to be_nil
        expect(admin_publication.scheduled_by).to be_nil
      end

      it 'sets first_published_at when publishing for the first time' do
        admin_publication.update!(first_published_at: nil)

        described_class.perform_now(admin_publication)

        admin_publication.reload
        expect(admin_publication.first_published_at).to be_present
      end

      it 'fires the changed and published activities' do
        expect { described_class.perform_now(admin_publication) }
          .to have_enqueued_job(LogActivityJob).with(project, 'changed', user, anything, anything)
          .and have_enqueued_job(LogActivityJob).with(project, 'published', user, anything, anything)
      end
    end

    context 'when transitioning from archived to published' do
      before_all do
        admin_publication.update_columns(
          publication_status: 'archived', first_published_at: 1.day.ago,
          scheduled_status: 'published', scheduled_at: 1.hour.ago, scheduled_by_id: user.id
        )
      end

      it 'materializes the transition and clears scheduled fields' do
        described_class.perform_now(admin_publication)

        admin_publication.reload
        expect(admin_publication.read_attribute(:publication_status)).to eq('published')
        expect(admin_publication.scheduled_status).to be_nil
        expect(admin_publication.scheduled_at).to be_nil
        expect(admin_publication.scheduled_by).to be_nil
      end

      it 'does not fire the published activity' do
        described_class.perform_now(admin_publication)
        expect(LogActivityJob).not_to have_been_enqueued.with(project, 'published', anything, anything)
      end
    end

    context 'when scheduled_at is in the future' do
      before do
        admin_publication.update!(
          scheduled_status: 'published',
          scheduled_at: 2.hours.from_now,
          scheduled_by_id: user.id
        )
      end

      it 'does nothing' do
        expect { described_class.perform_now(admin_publication) }
          .to  not_change { admin_publication.reload.publication_status }
          .and not_change { admin_publication.reload.scheduled_status }
          .and not_change { admin_publication.reload.scheduled_at }
          .and not_change { admin_publication.reload.scheduled_by_id }
      end
    end

    context 'when already at target status' do
      before do
        admin_publication.update_columns(
          publication_status: 'published', scheduled_status: 'published',
          scheduled_at: 1.hour.ago, scheduled_by_id: user.id
        )
      end

      it 'clears scheduled fields without firing side effects' do
        expect { described_class.perform_now(admin_publication) }
          .not_to have_enqueued_job(LogActivityJob)

        admin_publication.reload
        expect(admin_publication.scheduled_status).to be_nil
        expect(admin_publication.scheduled_at).to be_nil
        expect(admin_publication.scheduled_by).to be_nil
      end
    end
  end

  context 'without arguments (sweep mode)' do
    let!(:due_project) do
      create(:project, admin_publication_attributes: { publication_status: 'published' }).tap do |p|
        p.admin_publication.update_columns(scheduled_status: 'archived', scheduled_at: 1.hour.ago)
      end
    end

    let!(:due_folder) do
      create(:project_folder, admin_publication_attributes: { publication_status: 'draft' }).tap do |pf|
        pf.admin_publication.update_columns(scheduled_status: 'published', scheduled_at: 1.hour.ago)
      end
    end

    let!(:future_project) do
      create(:project, admin_publication_attributes: { publication_status: 'draft' }).tap do |p|
        p.admin_publication.update_columns(scheduled_status: 'published', scheduled_at: 2.hours.from_now)
      end
    end

    it 'processes all due transitions' do
      described_class.perform_now

      expect(due_project.admin_publication.reload.read_attribute(:publication_status)).to eq('archived')
      expect(due_folder.admin_publication.reload.read_attribute(:publication_status)).to eq('published')
      expect(future_project.admin_publication.reload.read_attribute(:publication_status)).to eq('draft')
    end
  end
end
