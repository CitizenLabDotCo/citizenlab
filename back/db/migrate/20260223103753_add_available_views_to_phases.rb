class AddAvailableViewsToPhases < ActiveRecord::Migration[7.2]
  def up
    add_column :phases, :available_views, :string, array: true, default: ['card'], null: false

    # Backfill: before this feature, all views were implicitly enabled.
    # Map view is only included if the location_description custom field is enabled.
    # For ideation, the custom form lives on the project; for proposals, on the phase.
    Phase.reset_column_information
    Phase.find_each do |phase|
      views = ['card']
      views << 'map' if location_description_enabled?(phase)
      views << 'feed' if phase.presentation_mode == 'feed'
      phase.update_column(:available_views, views)
    end
  end

  def down
    remove_column :phases, :available_views
  end

  private

  def location_description_enabled?(phase)
    context = case phase.participation_method
    when 'ideation'
      phase.project # Ideation forms live on the project
    when 'proposals'
      phase # Proposals forms live on the phase
    else
      return false
    end

    custom_form = CustomForm.find_by(participation_context: context)
    return true unless custom_form # No persisted form means defaults are used, and location_description is enabled by default

    field = CustomField.find_by(resource: custom_form, code: 'location_description')
    return true unless field # No persisted field means default (enabled)

    field.enabled?
  end
end
