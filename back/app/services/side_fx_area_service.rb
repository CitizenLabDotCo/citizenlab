# frozen_string_literal: true

class SideFxAreaService
  include SideFxHelper

  def before_create(area, user); end

  def after_create(area, user)
    LogActivityJob.perform_later(area, 'created', user, area.created_at.to_i)
  end

  def before_update(area, user); end

  def after_update(area, user)
    LogActivityJob.perform_later(area, 'changed', user, area.updated_at.to_i)
  end

  def before_destroy(area, _user)
    domicile_custom_field = CustomField.registration.find_by(code: 'domicile')
    return unless domicile_custom_field

    UserCustomFieldService.new.delete_custom_field_option_values area.id, domicile_custom_field
  end

  def after_destroy(frozen_area, user)
    serialized_area = clean_time_attributes(frozen_area.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_area), 'deleted', user, Time.now.to_i, payload: { area: serialized_area })
  end
end

SideFxAreaService.prepend(SmartGroups::Patches::SideFxAreaService)
