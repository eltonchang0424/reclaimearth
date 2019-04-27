// Initialize Firebase
var config = {
	apiKey: "AIzaSyBRUeNxucAPyphAtZWgxSWR_fCPIJPvAfo",
	authDomain: "citrushack2019-a7dd9.firebaseapp.com",
	databaseURL: "https://citrushack2019-a7dd9.firebaseio.com",
	projectId: "citrushack2019-a7dd9",
	storageBucket: "citrushack2019-a7dd9.appspot.com",
	messagingSenderId: "876422418130"
};
firebase.initializeApp(config);

var firestore = firebase.firestore();
var storage = firebase.storage();

var markersArray = [];


function posToString(latLng) {
	return latLng.lat().toString() + latLng.lng().toString();
}

function isNewMarker(latlng) {
	for (var i = 0; i < markersArray.length; i++) {
		if (markersArray[i].getPosition().equals(latlng)) {
			return false;
		}
	}
	return true;
}


getRealTimeUpdates = function(map) {
	console.log("updating")
	firestore.collection("locations")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            myData = doc.data();
            if (isNewMarker(new google.maps.LatLng(myData.lat, myData.long))) {
            	console.log(doc.id, " => ", myData);
            	latlng = {lat: myData.lat, lng: myData.long};
            	createMarker(latlng, myData.date, myData.severity, myData.imageUrl, myData.description);
            }
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}


function addLocation(latLng, severitylevel, image, description) {
	console.log(latLng);
	var docRef = firestore.doc("locations/" + posToString(latLng));
	console.log(docRef);
	if (!docRef.exists){
		console.log("marker doesn't exist, creating new one");
		var d = new Date();
		console.log(d);
		var dateString = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
		docRef.set({
			lat: latLng.lat(),
			long: latLng.lng(),
			severity: severitylevel,
			imageUrl: image,
			date: dateString,
			description: description
		}).then(function() {
			console.log("position saved")
		}).catch(function(error) {
			console.log("Got an error: ", error);
		})
	}	
}

function removeMarker(marker) {
	console.log(marker.getPosition())
	firestore.collection("locations")
	.where("lat", "==", marker.getPosition().lat())
	.where("long", "==", marker.getPosition().lng())
	.get()
	.then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			var storageRef = storage.ref();
			var name = marker.getPosition().lat().toString() + marker.getPosition().lng().toString();
			var childRef = storageRef.child(name);
			childRef.delete();
			doc.ref.delete();

		})
	})
	
	marker.setMap(null);
	for (var i = 0; i < markersArray.length; i++) {
		if (markersArray[i].getPosition().equals(marker.getPosition())) {
			markersArray.splice(i,1);
      		break;
   		}
	}
}

function createMarker(latlng, date, severity, imageUrl, description) {
	console.log("icon: " + iconBase + severity + ".png");
	var marker = new google.maps.Marker({
		position: latlng,
		icon: iconBase + severity + ".png",
		map: map
	});
	var grReference = storage.refFromURL(imageUrl);
	var infowindow = new google.maps.InfoWindow();
	var downloadUrl = grReference.getDownloadURL().then(function(url){
		var con = '<div style="font-family:TeenageAngst"><h1><strong>' + date + ' - Level ' + severity + '</strong></h1><br>\
			\
		<h3>' + description + '</h3><img src=' + url + ' height="50" alt="" id="imagePreview" align="right"></div>';
		infowindow.setContent(con);
	});

	marker.addListener('click', function() {

		if (isInfoWindowOpen(infowindow)){
		    infowindow.close();
		} else {
		    infowindow.open(map, marker)
		}

	});
	marker.addListener('rightclick', function() {
		removeMarker(marker);

	});

	markersArray.push(marker);
}

function isInfoWindowOpen(infoWindow){
    var map = infoWindow.getMap();
    return (map !== null && typeof map !== "undefined");
}
