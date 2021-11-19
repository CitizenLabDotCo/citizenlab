class SideFxAreaService
  include SideFxHelper

  def before_create area, user

  end

  def after_create area, user
    LogActivityService.new.run(area, 'created', user, area.created_at.to_i)
  end

  def before_update area, user

  end

  def after_update area, user
    LogActivityService.new.run(area, 'changed', user, area.updated_at.to_i)
  end

  def before_destroy area, user
    domicile_custom_field = CustomField.with_resource_type('User').find_by(code: 'domicile')
    if domicile_custom_field
      UserCustomFieldService.new.delete_custom_field_option_values area.id, domicile_custom_field
    end
  end

  def after_destroy frozen_area, user
    serialized_area = clean_time_attributes(frozen_area.attributes)
    LogActivityService.new.run(encode_frozen_resource(frozen_area), 'deleted', user, Time.now.to_i, payload: {area: serialized_area})
  end

end

SideFxAreaService.prepend_if_ee('SmartGroups::Patches::SideFxAreaService')
