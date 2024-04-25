/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
  lat: 48.208493,
  lng: 16.373118,
  title: "Stephansdom",
};

// Karte initialisieren
let map = L.map("map").setView([stephansdom.lat, stephansdom.lng], 12);

// BasemapAT Layer mit Leaflet provider plugin als startLayer Variable
let startLayer = L.tileLayer.provider("BasemapAT.grau");
startLayer.addTo(map);

let themaLayer = {
  sights: L.featureGroup(),
  lines: L.featureGroup(),
  stops: L.featureGroup(),
  zones: L.featureGroup(),
  hotels: L.markerClusterGroup({
    disableClusteringAtZoom: 17
  }).addTo(map),
}
// Hintergrundlayer
L.control
  .layers({
    "BasemapAT Grau": startLayer,
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay"),
    "BasemapAT Kinderkarte": L.tileLayer.provider("OpenTopoMap"),
  }, {
    "Sehenswürdigkeiten": themaLayer.sights,
    "Wien Sightseeing Linien": themaLayer.lines,
    "Wien Haltestellen": themaLayer.stops,
    "Wien Fußgängerzonen": themaLayer.zones,
    "Wien Hotels": themaLayer.hotels,
  })
  .addTo(map);

// Maßstab
L.control
  .scale({
    imperial: false,
  })
  .addTo(map);

L.control.fullscreen().addTo(map);

// function addiere(zahl1, zahl2) {
// let summe = zahl1 + zahl2;
//console.log("Summe:", summe);
//}

//addiere(4, 7);

async function loadSights(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
        icon: L.icon({
          iconUrl: "icons/photo.png",
          iconAnchor: [16, 37],
          popupAnchor: [0, -37]
        })
      });
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.NAME);
      layer.bindPopup(`
        <img src="${feature.properties.THUMBNAIL}" alt="*">
        <h4><a href="${feature.properties.WEITERE_INF}"
        target="wien"> ${feature.properties.NAME} </a></h4>
        <address>${feature.properties.ADRESSE}</address>
      `);
    }
  }).addTo(themaLayer.sights);
}
loadSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json")


async function loadlines(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    style: function(feature) {
      //console.log(feature.properties.LINE_NAME);
      let lineName = feature.properties.LINE_NAME;
      let lineColor = "black";
      if (lineName == "Red Line") {
        lineColor = "#FF4136";
      } else if (lineName == "Yellow Line") {
        lineColor = "#FFDC00";
      } else if (lineName == "Blue Line") {
        lineColor = "#0074D9";
      } else if (lineName == "Green Line") {
        lineColor = "#2ECC40";
      } else if (lineName == "Grey Line") {
        lineColor = "#AAAAAA";
      } else if (lineName == "Orange Line") {
        lineColor = "#FF851B";
      } else {
        //veilleicht kommen och andere Linien dazu ...
      }
      return {
        color: lineColor
      };
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.LINE_NAME);
      layer.bindPopup(`
      <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4>
      <i class="fa-regular fa-circle-stop"></i> ${feature.properties.FROM_NAME} <br>
      <i class="fa-solid fa-arrow-down"></i> <br>
      <i class="fa-regular fa-circle-stop"></i> ${feature.properties.TO_NAME}
      `
    );
    }
  }).addTo(themaLayer.lines);
}
loadlines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json")

/* 
bus_1.png Red
bus_2.png Yellow
bus_3.png Blue
bus_4.png Green
bus_5.png Grey
bus_6.png Orange
*/
async function loadstops(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
      icon: L.icon({
        iconUrl: `icons/bus_${feature.properties.LINE_ID}.png`,
        iconAnchor: [16, 37],
        popupAnchor: [0, -37]
      })
    });
  },
      onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.STAT_NAME);
      layer.bindPopup(`
      <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4>
      ${feature.properties.STAT_ID}
      ${feature.properties.STAT_NAME}`
      );
    }
  }).addTo(themaLayer.stops);
}
loadstops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json")

async function loadzones(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    style: function(feature) {
      return {color: "#F012BE",
      weight: 1,
      opacity: 0.4,
      fillOpacity: 0.1,
      };
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.ADRESSE);
      layer.bindPopup(`
      <h4>Fußgängerzone ${feature.properties.ADRESSE}</h4>
      <i class="fa-regular fa-clock"></i> ${feature.properties.ZEITRAUM || "dauerhaft"} <br>
      <br> <i class="fa-solid fa-circle-info"></i> ${feature.properties.AUSN_TEXT || "ohne Ausnahmen"}
      `
      );
    }
  }).addTo(themaLayer.zones);
}
loadzones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json")

async function loadhotels(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    pointToLayer: function (feature, latlng) {
      let hotelKat = feature.properties.KATEGORIE_TXT
      let star;
      if (hotelKat == "1*") {
        star = "icons/hotel_1star.png"
      } else if (hotelKat == "2*") {
        star = "icons/hotel_2stars.png"
      } else if (hotelKat == "3*") {
        star = "icons/hotel_3stars.png"
      } else if (hotelKat == "4*") {
        star = "icons/hotel_4stars.png"
      } else if (hotelKat == "5*") {
        star = "icons/hotel_5stars.png"
      } else {
        star = "icons/hotel_0star.png"
      }
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: star,
          iconAnchor: [16, 37],
          popupAnchor: [0, -37],
        })
      });
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.BETRIEB);
      layer.bindPopup(`
      <h3> ${feature.properties.BETRIEB} </h3>
      <h4> ${feature.properties.BETRIEBSART_TXT} ${feature.properties.KATEGORIE_TXT} </h4>
      <hr>
      <p>Adr.: ${feature.properties.ADRESSE} <br>
      Tel.: <a href="tel:${feature.properties.KONTAKT_TEL}"> ${feature.properties.KONTAKT_TEL}</a> <br>
      E-Mail: <a href="mailto:${feature.properties.KONTAKT_EMAIL}">${feature.properties.KONTAKT_EMAIL}</a> <br>
      <a href="${feature.properties.WEBLINK1}"target="hotel">Homepage</a>
      `
      );
    }
  }).addTo(themaLayer.hotels);
}
loadhotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json")