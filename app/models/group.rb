class Group < ApplicationRecord

  MEMBERSHIP_TYPES = %W(manual rules)

  has_many :groups_projects, dependent: :destroy
  has_many :projects, through: :groups_projects
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :slug, uniqueness: true, format: {with: SlugService.new.regex }
  validates :membership_type, presence: true, inclusion: {in: MEMBERSHIP_TYPES}
  validates :rules, if: :rules?, json: {
    schema: -> { SmartGroupsService.new.generate_rules_json_schema },
    message: ->(errors) { errors.map{|e| {fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message]} } },
    options: {
      errors_as_objects: true
    }
  }

  before_validation :generate_slug, on: :create
  before_validation :set_membership_type, on: :create

  def add_member user
    self.users << user
  end

  def remove_member user
    self.users.delete user
  end

  def manual?
    self.membership_type == 'manual'
  end

  def rules?
    self.membership_type == 'rules'
  end

  private

  def generate_slug
    slug_service = SlugService.new
    self.slug ||= slug_service.generate_slug self, self.title_multiloc.values.first
  end

  def set_membership_type
    self.membership_type ||= 'manual'
  end

end
