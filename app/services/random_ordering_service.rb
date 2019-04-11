class RandomOrderingService

  def modulus_of_the_day date=Date.today
    # returns 36
    date.to_time.to_i.to_s.chars.map(&:to_i).sum
  end

end