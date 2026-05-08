# frozen_string_literal: true

class ProcessScheduledPublicationTransitionsJob < ApplicationJob
  queue_as :default

  def run(admin_publication = nil)
    if admin_publication
      process(admin_publication)
    else
      AdminPublication
        .where(scheduled_at: ..Time.current)
        .find_each { |admin_pub| process(admin_pub) }
    end
  end

  private

  def process(admin_pub)
    admin_pub.with_lock do
      return unless admin_pub.scheduled_at&.<=(Time.current)

      target = admin_pub.scheduled_status
      current = admin_pub.read_attribute(:publication_status)
      return admin_pub.cancel_scheduled_transition! if current == target

      user = admin_pub.scheduled_by

      # Going through the publication instead of directly updating the admin_publication is
      # a bit indirect, but this mirrors the controller update flow.
      publication = admin_pub.publication
      publication.assign_attributes(admin_publication_attributes: {
        publication_status: target,
        scheduled_status: nil,
        scheduled_at: nil,
        scheduled_by_id: nil
      })

      sidefx = sidefx_service(publication)
      sidefx.before_update(publication, user)
      publication.save!
      sidefx.after_update(publication, user)
    end
  end

  def sidefx_service(publication)
    case publication
    when Project then SideFxProjectService.new
    when ProjectFolders::Folder then ProjectFolders::SideFxProjectFolderService.new
    end
  end
end
