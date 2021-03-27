class CustomFieldOption < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, scope: :custom_field

  belongs_to :custom_field

  validates :custom_field, presence: true
  validates :key, presence: true, uniqueness: {scope: [:custom_field_id]}, format: { with: /\A[a-zA-Z0-9_]+\z/,
    message: "only letters, numbers and underscore" }
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validate :belongs_to_select_field

  before_validation :generate_key, on: :create


  private

  def belongs_to_select_field
    if custom_field && !custom_field.support_options?
      self.errors.add(
        :base,
        :option_on_non_select_field,
        message: 'The custom field option you\'re specifying does not belong to a custom field that supports options'
      )
    end
  end

  def generate_key
    if !self.key
      self.key = CustomFieldService.new.generate_key(self, title_multiloc.values.first) do |key_proposal|
        self.class.find_by(key: key_proposal, custom_field: self.custom_field)
      end
    end
  end
end

CustomFieldOption.include_if_ee('SmartGroups::Extensions::CustomFieldOption')
