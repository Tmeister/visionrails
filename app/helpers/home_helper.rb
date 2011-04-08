module HomeHelper

  def strip_tags tags
    ctags = ""
    tags.each do |tag|
      ctags << "#{tag} "
    end
    ctags
  end

end
