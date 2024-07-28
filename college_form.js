var request = new XMLHttpRequest();
request.open("GET", "./college_list.json", false);
request.send(null)
var college_list = JSON.parse(request.responseText);

var request = new XMLHttpRequest();
request.open("GET", "./college_paths.json", false);
request.send(null)
var college_paths = JSON.parse(request.responseText);

// TSP Stuff ---------------------------------------------------

function Path(points, distanceFunc, keepEnd) {
    this.points = points;
    this.distanceFunc = distanceFunc;
    this.keepEnd = keepEnd;
    this.initializeOrder();
    this.initializeDistances();
  }
  Path.prototype.initializeOrder = function() {
    // A loop is about 3x faster than using a spread operator.
    this.order = new Array(this.points.length);
    for (var i = 0; i < this.order.length; i++) this.order[i] = i;
  }

  Path.prototype.initializeDistances = function() {
    this.distances = new Array(this.points.length * this.points.length);
    for(var i = 0; i < this.points.length; i++) {
      for(var j = i + 1; j < this.points.length; j++) {
        this.distances[j + i * this.points.length] = this.distanceFunc(this.points[i], this.points[j]);
      }
    }
  };
  Path.prototype.change = function(temp) {
    var i = this.randomPos(), j = this.randomPos();
    var delta = this.delta_distance(i, j);
    if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
      this.swap(i,j);
    }
  };
  Path.prototype.swap = function(i,j) {
    var tmp = this.order[i];
    this.order[i] = this.order[j];
    this.order[j] = tmp;
  };
  Path.prototype.delta_distance = function(i, j) {
    var jm1 = this.index(j-1),
        jp1 = this.index(j+1),
        im1 = this.index(i-1),
        ip1 = this.index(i+1);
    var s = 
        this.distance(jm1, i  )
      + this.distance(i  , jp1)
      + this.distance(im1, j  )
      + this.distance(j  , ip1)
      - this.distance(im1, i  )
      - this.distance(i  , ip1)
      - this.distance(jm1, j  )
      - this.distance(j  , jp1);
    if (jm1 === i || jp1 === i)
      s += 2*this.distance(i,j); 
    return s;
  };
  Path.prototype.index = function(i) {
    return (i + this.points.length) % this.points.length;
  };
  Path.prototype.access = function(i) {
    return this.points[this.order[this.index(i)]];
  };

Path.prototype.distance = function(i, j) {
    if (i === j) return 0; // Identity.
  
    // Ensure low is actually lower.
    var low = this.order[i], high = this.order[j];
    if (low > high) { low = this.order[j]; high = this.order[i]; }
  
    return this.distances[low * this.points.length + high] || 0;
  };

Path.prototype.randomPos = function() {
    return 1 + Math.floor(Math.random() * (this.points.length - (this.keepEnd ? 2 : 1)));
};

function Point(x, y) {
    this.x = x;
    this.y = y;
  };

function solve(points, temp_coeff = 0.999, callback, distance = euclidean, keep_end = false) {
    var path = new Path(points, distance, keep_end);
    // Optimization: If there is only one point in the list, there is no path.
    if (points.length < 2) return path.order;
    // Optimization: If the user would provide a bad input, end immediately.
    if (temp_coeff >= 1 || temp_coeff <= 0) return path.order;
  
    // Create a temperature coefficient.
    if (!temp_coeff)
      temp_coeff = 1 - Math.exp(-10 - Math.min(points.length,1e6)/1e5);
    var hasCallback = typeof(callback) === "function";
  
    for (var temperature = 100 * distance(path.access(0), path.access(1));
             temperature > 1e-6;
             temperature *= temp_coeff) {
      path.change(temperature);
      if (hasCallback) callback(path.order);
    }
    return path.order;
  };

// -----------------------------------------------------------

let waypointMarker = {
	path: google.maps.SymbolPath.CIRCLE,
	fillColor: 'black',
	strokeColor: 'black',
	strokeWeight: 10,
    strokeOpacity: 1,
	scale: 5,
	textColor: 'white'
}

async function updateMap(ordered_colleges) {
    const position = { lat: 51.76, lng: -1.25 };
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const directionsService = new google.maps.DirectionsService();

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 15,
        center: position,
        mapId: "DEMO_MAP_ID",
    });

    console.log("----------------------------")

    // console.log(ordered_colleges[0], ordered_colleges[1])

    // console.log(college_paths[ordered_colleges[0]][ordered_colleges[1]]["routes"][0]["polyline"]["encodedPolyline"])

    // decoded_path = google.maps.geometry.encoding.decodePath(college_paths[ordered_colleges[0]][ordered_colleges[1]]["routes"][0]["polyline"]["encodedPolyline"])

    // const flightPath = new google.maps.Polyline({
    //     path: decoded_path,
    //     geodesic: true,
    //     strokeColor: "#FF0000",
    //     strokeOpacity: 1.0,
    //     strokeWeight: 2,
    // });
    
    // flightPath.setMap(map);

    for(i=0;i<ordered_colleges.length-1;i++){
        console.log(i)

        decoded_path = google.maps.geometry.encoding.decodePath(college_paths[ordered_colleges[i]][ordered_colleges[i+1]]["routes"][0]["polyline"]["encodedPolyline"])
        var flightPath = new google.maps.Polyline({
            path: decoded_path,
            geodesic: true,
            strokeColor: "hsl(" + (360 * i / ordered_colleges.length) + ",80%,50%)",
            strokeOpacity: 0.5,
            strokeWeight: 5,
        });

        flightPath.setMap(map);

        console.log(college_paths[ordered_colleges[i]][ordered_colleges[i+1]]["routes"][0]["legs"][0])

        var marker = new google.maps.Marker({
			position: {
                "lat": college_paths[ordered_colleges[i]][ordered_colleges[i+1]]["routes"][0]["legs"][0]["startLocation"]["latLng"]["latitude"],
                "lng": college_paths[ordered_colleges[i]][ordered_colleges[i+1]]["routes"][0]["legs"][0]["startLocation"]["latLng"]["longitude"]
            },
			icon: waypointMarker,
			title:"Hello World!",
			label: {
				text: (i+1).toString(),
				color: 'white'
			}
		});

		marker.setMap(map);
    }

    var marker = new google.maps.Marker({
        position: {
            "lat": college_paths[ordered_colleges[ordered_colleges.length-1]][ordered_colleges[0]]["routes"][0]["legs"][0]["startLocation"]["latLng"]["latitude"],
            "lng": college_paths[ordered_colleges[ordered_colleges.length-1]][ordered_colleges[0]]["routes"][0]["legs"][0]["startLocation"]["latLng"]["longitude"]
        },
        icon: waypointMarker,
        title:"Hello World!",
        label: {
            text: (ordered_colleges.length).toString(),
            color: 'white'
        }
    });

    marker.setMap(map);
}

function applyThings() {
    console.log("Oops")

    console.log(
        Array.prototype.slice.call(
            (document.forms["choose_colleges"]).children
        ).map(
            (a) => Array.prototype.slice.call((a.children)).filter((b) => b.type == "checkbox")
        ).filter((c) =>c.length > 0)
    )

    var form_result = Array.prototype.slice.call(
        (document.forms["choose_colleges"]).children
    ).map(
        (a) => Array.prototype.slice.call((a.children)).filter((b) => b.type == "checkbox")
    ).filter(
        (c) =>c.length > 0
    ).map(
        (z) => ({"college_name": z[0].id, "include": z[0].value})
    )

    console.log(form_result)

    included_colleges = form_result.filter(
        (y) => y["include"] == "true"
    ).map(
        (z) => z["college_name"]
    )

    console.log(included_colleges)

    var distance_matrix = new Array(included_colleges.length);

    for (var i = 0; i < included_colleges.length; i++) {
        distance_matrix[i] = new Array(included_colleges.length);
    }

    for(var i=0; i<included_colleges.length; i++){
        for(var j=i+1; j<included_colleges.length; j++){
            distance_matrix[i][j] = college_paths[included_colleges[i]][included_colleges[j]]["routes"][0]["distanceMeters"]
            distance_matrix[j][i] = college_paths[included_colleges[i]][included_colleges[j]]["routes"][0]["distanceMeters"]
        }
    }

    for(var i=0; i<included_colleges.length; i++){
        distance_matrix[i][i] = 0
    }

    console.log(distance_matrix);
    
    var points = []
    for (i=0; i<included_colleges.length; i++){
        points.push(new Point(i, 0))
    }

    function distancePoints(a, b) {
        return distance_matrix[a.x][b.x];
    };

    var solution = solve(points, 0.999, false, distancePoints, false)

    console.log(solution);
    
    ordered_colleges = solution.map((i) => included_colleges[i])

    console.log(ordered_colleges.keys)

    updateMap(ordered_colleges)

    var text = document.getElementById("form_output")
    var college_index = 0
    text.innerHTML= ordered_colleges.map((y) => {
        college_index += 1;
        console.log(college_index);
        return ` ${college_index}: ${y}`
    })
};

function update_checkbox_value(college_name) {
    console.log("######")
    console.log(college_name);
    console.log(college_name.value);

    college_name.setAttribute("value", ((college_name.value == "false") ? "true" : "false") );
    college_name.setAttribute("checked", ((college_name.checked == "false") ? "true" : "false") );

    console.log(college_name);
};


const form = document.createElement("form")
form.setAttribute("name", "choose_colleges")
// form.setAttribute("method", "post")


for (const college in college_list){
    const college_div = document.createElement("div")
    college_div.setAttribute("style", "border-style: solid; border-width: 1px; border-radius:3px; margin:2px;")

    const radio = document.createElement("input")
    radio.setAttribute('type', 'checkbox');
    radio.setAttribute('id', college);
    radio.setAttribute("checked", true);
    radio.setAttribute('value', true);

    college_div.setAttribute("for", college)
    radio.setAttribute("onclick", `update_checkbox_value(${college})`);

    const label = document.createElement("label")
    label.setAttribute("for", college)
    label.innerHTML = college

    college_div.appendChild(radio)
    college_div.appendChild(label)

    form.appendChild(college_div)
}

const submit = document.createElement("input")
submit.setAttribute("type", "button")
submit.setAttribute("value", "Submit")
submit.setAttribute("onclick", "applyThings()")
submit.setAttribute("style", "border-style: solid; width: 100%; border-width: 1px; border-radius:3px; margin:2px")// :hover {background: red}")
form.appendChild(submit)

const element = document.getElementById("form");
element.appendChild(form);
console.log("hi")