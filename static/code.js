var map, infoWindow;
var trashicon = {
  url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' ,
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 10,
    zoomControl: true,
  });
  infoWindow = new google.maps.InfoWindow;
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      map.setCenter(pos);
      map.addListener('click', function(e) {
        addLocation(e.latLng, map);
      });

      document.getElementById('ping').onclick = function() {
      	console.log("clicked ping " + pos)
      	console.log(new google.maps.LatLng(pos))
        addLocation(new google.maps.LatLng(pos), map);
      };

      getRealTimeUpdates(map);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}