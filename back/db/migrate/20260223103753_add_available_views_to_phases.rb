class AddAvailableViewsToPhases < ActiveRecord::Migration[7.2]
  def up
    add_column :phases, :available_views, :string, array: true, default: ['card'], null: false

    # Backfill: before this feature, all views were implicitly enabled.
    # Map view is only included if the location_description custom field is enabled.
    # For ideation, the custom form lives on the project; for proposals, on the phase.
    Phase.reset_column_information

    location_fields = CustomField.where(code: 'location_description').index_by(&:resource_id)

    Phase.includes(:custom_form, project: :custom_form).each do |phase|
      views = ['card']
      views << 'map' if location_description_enabled?(phase, location_fields)
      views << 'feed' if phase.presentation_mode == 'feed'
      phase.update_column(:available_views, views)
    end
  end

  def down
    remove_column :phases, :available_views
  end

  private

  def location_description_enabled?(phase, location_fields)
    context = case phase.participation_method
    when 'ideation'
      phase.project # Ideation forms live on the project
    when 'proposals'
      phase # Proposals forms live on the phase
    else
      return false
    end

    custom_form = context.custom_form
    return true unless custom_form # No persisted form means defaults are used, and location_description is enabled by default

    field = location_fields[custom_form.id]
    return true unless field # No persisted field means default (enabled)

    field.enabled?
  end
end
