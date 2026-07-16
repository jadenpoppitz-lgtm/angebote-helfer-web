import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type DemoDayMapLocation = {
  id: string;
  name: string;
  address: string;
  coordinates: readonly [number, number];
  routeUrl: string;
};

type DemoDayDresdenMapProps = {
  ariaLabel: string;
  currentLocation: string;
  locations: readonly DemoDayMapLocation[];
  nearestLabel: string;
  otherLabel: string;
  openRoute: string;
  zoomInTitle: string;
  zoomOutTitle: string;
};

const DRESDEN_CENTER: [number, number] = [51.0504, 13.7373];
const HTW_DRESDEN: [number, number] = [51.0374994, 13.7351679];

const currentLocationIcon = divIcon({
  className: "demo-day-leaflet-current",
  html: "<span><i></i></span>",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const locationIcon = (index: number) =>
  divIcon({
    className: `demo-day-leaflet-pin${index === 0 ? " is-nearest" : ""}`,
    html: `<span><b>${index + 1}</b></span>`,
    iconSize: [38, 44],
    iconAnchor: [19, 42],
    popupAnchor: [0, -38],
  });

const DemoDayDresdenMap = ({
  ariaLabel,
  currentLocation,
  locations,
  nearestLabel,
  otherLabel,
  openRoute,
  zoomInTitle,
  zoomOutTitle,
}: DemoDayDresdenMapProps) => (
  <MapContainer
    aria-label={ariaLabel}
    center={DRESDEN_CENTER}
    className="demo-day-leaflet-map"
    maxZoom={19}
    minZoom={9}
    preferCanvas
    scrollWheelZoom
    touchZoom
    zoom={11}
    zoomControl={false}
    zoomSnap={0.5}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      maxZoom={19}
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <ZoomControl position="topright" zoomInTitle={zoomInTitle} zoomOutTitle={zoomOutTitle} />

    <Marker
      alt={currentLocation}
      icon={currentLocationIcon}
      keyboard
      position={HTW_DRESDEN}
      title={currentLocation}
      zIndexOffset={800}
    >
      <Popup className="demo-day-leaflet-popup">
        <strong>HTW Dresden</strong>
        <span>Friedrich-List-Platz 1, 01069 Dresden</span>
      </Popup>
    </Marker>

    {locations.map((location, index) => (
      <Marker
        key={location.id}
        alt={`${location.name}, ${location.address}`}
        icon={locationIcon(index)}
        keyboard
        position={[location.coordinates[0], location.coordinates[1]]}
        title={location.name}
        zIndexOffset={index === 0 ? 700 : 500}
      >
        <Popup className="demo-day-leaflet-popup">
          <small>{index === 0 ? nearestLabel : otherLabel}</small>
          <strong>{location.name}</strong>
          <span>{location.address}</span>
          <a href={location.routeUrl} target="_blank" rel="noreferrer">
            {openRoute}
          </a>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default DemoDayDresdenMap;
