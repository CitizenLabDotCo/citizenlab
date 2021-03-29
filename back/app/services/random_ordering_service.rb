class RandomOrderingService

  def modulus_of_the_day date=Date.today
    1000 + date.to_time.to_i.to_s.chars.reverse[2..5].join.to_i
  end

end