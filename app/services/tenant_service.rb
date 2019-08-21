class TenantService

  def clear_images_and_files! tenant
    # Except tenant images and text images
    Apartment::Tenant.switch(tenant.schema_name) do
      EventFile.all.each(&:destroy!)
      IdeaImage.all.each(&:destroy!)
      IdeaFile.all.each(&:destroy!)
      Initiative.in_batches.update_all(header_bg: nil)
      InitiativeImage.all.each(&:destroy!)
      InitiativeFile.all.each(&:destroy!)
      PageFile.all.each(&:destroy!)
      PhaseFile.all.each(&:destroy!)
      ProjectImage.all.each(&:destroy!)
      ProjectFile.all.each(&:destroy!)
      Project.in_batches.update_all(header_bg: nil)
      User.in_batches.update_all(avatar: nil)
    end
  end

end
