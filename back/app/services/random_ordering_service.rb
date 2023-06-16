# frozen_string_literal: true

class RandomOrderingService
  def modulus_of_the_day(user = nil)
    date = Date.today
    modulus = 1000 + date.to_time.to_i.to_s.chars.reverse[2..5].join.to_i
    if user&.id
      modulus + user.id[0...4].chars.sum(&:ord)
    else
      modulus
    end
  end
end
