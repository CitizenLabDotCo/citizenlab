# frozen_string_literal: true

# == Schema Information
#
# Table name: groups
#
#  id                :uuid             not null, primary key
#  title_multiloc    :jsonb
#  slug              :string
#  memberships_count :integer          default(0), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  membership_type   :string
#  rules             :jsonb
#
# Indexes
#
#  index_groups_on_slug  (slug)
#
class Group < ApplicationRecord
  include EmailCampaigns::GroupDecorator

  has_many :groups_projects, dependent: :destroy
  has_many :projects, through: :groups_projects
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  private :memberships, :memberships=, :membership_ids, :membership_ids=
  private :users, :users=, :user_ids, :user_ids=
  has_many :groups_permissions, dependent: :destroy
  has_many :permissions, through: :groups_permissions

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :slug, uniqueness: true, presence: true
  validates :membership_type, presence: true, inclusion: { in: proc { membership_types } }

  before_validation :generate_slug, on: :create
  before_validation :set_membership_type, on: :create
  before_validation :strip_title

  scope :order_new, ->(direction = :desc) { order(created_at: direction) }
  scope :with_user, ->(user) { Group._with_user(self, user) } # Delegating to class method makes it easier to patch.

  def self._with_user(groups, user)
    groups.left_outer_joins(:users).where(users: { id: user.id })
  end

  def add_member(user)
    users << user
    self
  end

  def remove_member(user)
    users.delete user
    self
  end

  def members
    users
  end

  def members=(*users)
    self.users = users.flatten
  end

  def member_ids
    user_ids
  end

  def member_ids=(*user_ids)
    self.user_ids = user_ids.flatten
  end

  def manual?
    membership_type == 'manual'
  end

  def update_memberships_count!
    update!(memberships_count: memberships.where(user: User.registered).count)
  end

  def self.membership_types
    %w[manual]
  end

  private

  def generate_slug
    self.slug ||= SlugService.new.generate_slug self, title_multiloc.values.first
  end

  def set_membership_type
    self.membership_type ||= 'manual'
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end
end

Group.prepend(SmartGroups::Patches::Group)
