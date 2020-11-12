class Group < ApplicationRecord
  include EmailCampaigns::GroupDecorator

  MEMBERSHIP_TYPES = %W(manual rules)

  has_many :groups_projects, dependent: :destroy
  has_many :projects, through: :groups_projects
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  private :memberships, :memberships=, :membership_ids, :membership_ids=
  private :users, :users=, :user_ids, :user_ids=
  has_many :groups_permissions, dependent: :destroy
  has_many :permissions, through: :groups_permissions

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :slug, uniqueness: true, presence: true
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
  before_validation :strip_title

  scope :using_custom_field, -> (custom_field) {
    subquery = Group.select("jsonb_array_elements(rules) as rule, id")
    where(membership_type: 'rules')
      .joins("LEFT OUTER JOIN (#{subquery.to_sql}) as r ON groups.id = r.id")
      .where("r.rule->>'customFieldId' = ?", custom_field.id)
      .distinct
  }

  scope :using_custom_field_option, -> (custom_field_option) {
    subquery = Group.select("jsonb_array_elements(rules) as rule, id")
    where(membership_type: 'rules')
      .joins("LEFT OUTER JOIN (#{subquery.to_sql}) as r ON groups.id = r.id")
      .where("r.rule->>'value' = ?", custom_field_option.id)
      .distinct
  }

  scope :order_new, -> (direction=:desc) {order(created_at: direction)}

  scope :rules, -> { where(membership_type: 'rules')}

  def member? user
    if rules?
      SmartGroupsService.new.groups_for_user(user).where(id: id).exists?
    else
      users.where(id: user.id).exists?
    end
  end

  def add_member user
    if manual?
      users << user
    else
      raise "can't add a member to the rules group #{id}"
    end
  end

  def remove_member user
    if manual?
      users.delete user
    else
      raise "can't remove a member from the rules group #{id}"
    end
  end

  def members
    if manual?
      users
    elsif rules?
      SmartGroupsService.new.filter(User, rules)
    end
  end

  def members= *args
    if manual?
      users= *args
    else
      raise "can't set members if a rules group"
    end
  end

  def member_ids
    if manual?
      user_ids
    else
      SmartGroupsService.new.filter(User, rules).ids
    end
  end

  def member_ids= *args
    if manual?
      user_ids= *args
    else
      raise "can't set member_ids of a rules group"
    end
  end

  def manual?
    self.membership_type == 'manual'
  end

  def rules?
    self.membership_type == 'rules'
  end

  def update_memberships_count!
    if rules?
      self.update(memberships_count: members.active.count)
    end
    # The manual? case is covered by counter_culture in membership.rb
  end

  private

  def generate_slug
    slug_service = SlugService.new
    self.slug ||= slug_service.generate_slug self, self.title_multiloc.values.first
  end

  def set_membership_type
    self.membership_type ||= 'manual'
  end


  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end
end
