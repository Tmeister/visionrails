class HomeController < ApplicationController
  def index
    require 'instagram'
    
    Instagram.configure do |config|
      config.client_id = "0447a7d130ae478580ab3a3f9cbd35cd"
      config.client_secret = "45f96d2f48b641b496b92d9baf9adc94"
    end
    
    @pictures = Instagram.media_popular

  end
end
