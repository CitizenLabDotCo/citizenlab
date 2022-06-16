# frozen_string_literal: true

# Polymorphic association to associate with all kinds of pages.
# == Schema Information
#
# Table name: pages
#
#  id            :uuid             not null, primary key
#  pageable_type :string           not null
#  pageable_id   :uuid             not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_pages_on_pageable  (pageable_type,pageable_id)
#
class Page < ApplicationRecord
  belongs_to :pageable, polymorphic: true
end
