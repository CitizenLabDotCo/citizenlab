class MoveLocationAllowedFromProjectsToCustomFields < ActiveRecord::Migration[6.0]
  def change
    ml_s = MultilocService.new
    Project.where(location_allowed: false).each do |project|
      # At the moment of writing locations are 
      # enabled by default, and so only when
      # disabled changes are required.
      custom_form = project.custom_form || CustomForm.create(project: project)
      if !custom_form.custom_fields.find_by(code: 'location')
        CustomField.create(
          resource: custom_form,
          key: 'location',
          code: 'location',
          input_type: 'text',
          title_multiloc: ml_s.i18n_to_multiloc(
            'custom_fields.ideas.location.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
              ml_s.i18n_to_multiloc(
                'custom_fields.ideas.location.description',
                locales: CL2_SUPPORTED_LOCALES
              )
            rescue
              {}
            end,
          required: false,
          enabled: false
        )
      end
    end
    remove_column :projects, :location_allowed
  end
end
