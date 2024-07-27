// Initialize and add the map
let map;

// const path = [
// 	"62A Cowley Road, Oxford, OX1 3PG",
// 	"Magdalen College, Oxford",
// 	"St Catherine's College, Oxford",
// 	"7 New College Ln, Oxford",
// 	"Mansfield College, Oxford",
// 	"Lady Margaret Hall, Oxford",
// 	"St Hugh's College, Oxford",
// 	"St Anne's College, Oxford",
// 	"Somerville College, Oxford",
// 	"Keble College, Oxford",
// 	"56 Broad St, Oxford",
// 	"Wadham College, Oxford",
// 	"Hertford College, Oxford",
// 	"All Souls College, Oxford",
// 	"Oriel College, Oxford",
// 	"Brasenose College Guest Rooms, Oxford",
// 	"Lincoln College, Oxford",
// 	"Jesus College, Oxford",
// 	"Exeter College, Oxford",
// 	"Balliol College Porter's Lodge, Oxford",
// 	"St John's College, Oxford",
// 	"Worcester College, Oxford",
// 	"St Peter's College, Oxford",
// 	"Pembroke College, Oxford",
// 	"Christ Church College, Oxford",
// 	"Corpus Christi College, Oxford",
// 	"4 Merton Street, Oxford",
// 	"86 High St, Oxford",
// 	"St Edmund Hall, Oxford",
// 	"Golden Rose Trading Ltd, Oxford",
// 	"St Hilda's College, Oxford",
// 	"62A Cowley Road, Oxford, OX1 3PG"
// ]

const path = [
	"62A Cowley Road, Oxford, OX1 3PG",
	"St Hilda's College, Oxford",
	"St Catherine's College, Oxford",
	"Mansfield College, Oxford",
	"Keble College, Oxford",
	"Lady Margaret Hall, Oxford",
	"St Hugh's College, Oxford",
	"St Anne's College, Oxford",
	"Somerville College, Oxford",
	"St John's College, Oxford",
	"Worcester College, Oxford",
	"St Peter's College, Oxford",
	"Pembroke College, Oxford",
	"Christ Church College, Oxford",
	"Lincoln College, Oxford",
	"Jesus College, Oxford",
	"Exeter College, Oxford",
	"Balliol College Porter's Lodge, Oxford",
	"56 Broad St, Oxford",
	"Wadham College, Oxford",
	"7 New College Ln, Oxford",
	"Hertford College, Oxford",
	"All Souls College, Oxford",
	"Brasenose College Guest Rooms, Oxford",
	"Oriel College, Oxford",
	"Corpus Christi College, Oxford",
	"4 Merton Street, Oxford",
	"Golden Rose Trading Ltd, Oxford",
	"86 High St, Oxford",
	"St Edmund Hall, Oxford",
	"Magdalen College, Oxford",
	"62A Cowley Road, Oxford, OX1 3PG",
]

let lineSymbol = {
    path: 'M 1.5 1 L 1 0 L 1 2 M 0.5 1 L 1 0',
    fillColor: 'black',
    strokeColor: 'black',
    strokeWeight: 2,
    strokeOpacity: 1
};

const {SymbolPath} = await google.maps.importLibrary("core")

let waypointMarker = {
	path: google.maps.SymbolPath.CIRCLE,
	fillColor: 'black',
	strokeColor: 'black',
	strokeWeight: 10,
    strokeOpacity: 1,
	scale: 5,
	textColor: 'white'
}

async function initMap() {
  // The location of Oxford
  const position = { lat: 51.75, lng: -1.23 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const directionsService = new google.maps.DirectionsService();
  
  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 14,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

//   let result = {};

//   for(let i=1; i < path.length; i++){
// 	const directionsRenderer = new google.maps.DirectionsRenderer({ 
// 		polylineOptions: { 
// 			strokeColor: "hsl(" + (360 * i / 31) + ",80%,50%)",
// 			strokeWeight: 5,
//     		strokeOpacity: 0.5,
// 			icons: [{
// 				icon: lineSymbol,
// 				offset: '25px',
// 				repeat: '100px'
// 			}],
// 		},
// 		markerOptions: {
// 			icon: waypointMarker,
// 			label: i
// 		}
// 	});
// 	directionsService
//     .route({
//       origin: {
//         query: path[i-1],
//       },
//       destination: {
//         query: path[i],
//       },
//       travelMode: google.maps.TravelMode.WALKING,
//     })
//     .then((response) => {
// 	  console.log(response)
// 	  result[(i).toString()] = response
// 	  console.log(JSON.stringify(result))
//       directionsRenderer.setDirections(response);
// 	//   directionsRenderer.setOptions({ suppressMarkers: true })
// 	  directionsRenderer.setMap(map);
// 	  console.log("Done")
// 	  console.log(i)
//     })
//     .catch((e) => window.alert("Directions request failed due to " + status));
//   }

	var request = new XMLHttpRequest();
	request.open("GET", "./finalpath.json", false);
	request.send(null)
	var finalpath = JSON.parse(request.responseText);
	console.log(finalpath);

  	for(let i=1; i <= path.length + 1; i++){
		const directionsRenderer = new google.maps.DirectionsRenderer({ 
			polylineOptions: { 
				strokeColor: "hsl(" + (360 * i / 31) + ",80%,50%)",
				strokeWeight: 5,
				strokeOpacity: 0.5,
				icons: [{
					icon: lineSymbol,
					offset: '25px',
					repeat: '100px'
				}],
			},
		});

		var marker = new google.maps.Marker({
			position: finalpath[(i).toString()]["routes"]["0"]["overview_path"][0],
			icon: waypointMarker,
			title:"Hello World!",
			label: {
				text: (i).toString(),
				color: 'white'
			}
		});

		marker.setMap(map);

		directionsRenderer.setDirections(finalpath[(i).toString()]);
		directionsRenderer.setOptions({ suppressMarkers: true })

		directionsRenderer.setMap(map);
	}

	map.center = position
}

initMap();