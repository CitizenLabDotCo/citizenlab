# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PurgesRelatedQueJobs do
  let(:project) { create(:project_with_phases) }
  let(:phase) { project.phases.first }

  def mail_job_for(record)
    create(
      :que_job,
      active_job_class: 'ActionMailer::MailDeliveryJob',
      related_gids: [record.to_global_id.to_s]
    )
  end

  it 'purges related jobs when a phase is destroyed' do
    job = mail_job_for(phase)

    expect { phase.destroy! }.to change { QueJob.exists?(job.id) }.to(false)
  end

  it 'purges phase-related jobs when the project cascade-destroys its phases' do
    # The cascade bypasses SideFx services entirely, which is why the purge is a model
    # callback: destroying a project must still cancel its phases' queued jobs.
    phase_job = mail_job_for(phase)
    admin_publication_job = create(
      :que_job,
      active_job_class: 'ProcessScheduledPublicationTransitionsJob',
      related_gids: [project.admin_publication.to_global_id.to_s]
    )

    project.destroy!

    expect(QueJob.where(id: [phase_job.id, admin_publication_job.id])).to be_empty
  end

  it 'does not purge when the destroy transaction rolls back' do
    job = mail_job_for(phase)

    ActiveRecord::Base.transaction do
      phase.destroy!
      raise ActiveRecord::Rollback
    end

    expect(QueJob.exists?(job.id)).to be true
    expect(Phase.exists?(phase.id)).to be true
  end

  it 'leaves unrelated jobs alone' do
    other_job = mail_job_for(create(:phase))

    phase.destroy!

    expect(QueJob.exists?(other_job.id)).to be true
  end
end
