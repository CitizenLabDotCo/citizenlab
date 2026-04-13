# frozen_string_literal: true

class ProcessScheduledPublicationTransitionJob < ApplicationJob
  queue_as :default

  def run(admin_publication_id)
    admin_pub = AdminPublication.find_by(id: admin_publication_id)
    return unless admin_pub
    # We check if the transition is due twice. The important check happens inside the lock.
    # This one is just an optimization to avoid locking unnecessarily.
    return unless transition_due?(admin_pub)

    admin_pub.with_lock do
      # Skip if the schedule was canceled, rescheduled to the future, or already processed.
      next unless transition_due?(admin_pub)

      target = admin_pub.scheduled_status
      current = admin_pub.read_attribute(:publication_status)
      next admin_pub.cancel_scheduled_transition! if current == target

      # Going through the publication instead of directly updating the admin_publication is
      # a bit indirect, but this mirrors the controller update flow.
      publication = admin_pub.publication
      publication.assign_attributes(admin_publication_attributes: { publication_status: target })

      sidefx = sidefx_service(publication)
      sidefx.before_update(publication, admin_pub.scheduled_by)
      publication.save!
      sidefx.after_update(publication, admin_pub.scheduled_by)
    end
  end

  private

  def transition_due?(admin_pub)
    admin_pub.scheduled_at.present? && admin_pub.scheduled_at <= Time.current
  end

  def sidefx_service(publication)
    case publication
    when Project then SideFxProjectService.new
    when ProjectFolders::Folder then ProjectFolders::SideFxProjectFolderService.new
    end
  end
end
