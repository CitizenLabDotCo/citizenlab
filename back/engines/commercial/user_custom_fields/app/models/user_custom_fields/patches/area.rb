# frozen_string_literal: true

module UserCustomFields::Patches::Area
  def self.included(base)
    base.class_eval do
      belongs_to :custom_field_option, dependent: :destroy, optional: true
      after_create :create_custom_field_option
      after_update :update_custom_field_option
    end
  end

  def create_custom_field_option
    return unless (domicile_field = CustomField.find_by(key: 'domicile'))

    create_custom_field_option!(
      custom_field: domicile_field,
      title_multiloc: title_multiloc,
      ordering: ordering
    )
  end

  def update_custom_field_option
    return unless custom_field_option
    return unless ordering_previously_changed? || title_multiloc_previously_changed?

    custom_field_option.update(
      title_multiloc: title_multiloc,
      ordering: ordering
    )
  end
end
