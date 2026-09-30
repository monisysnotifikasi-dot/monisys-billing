// Fallback type declaration for Leaflet
declare module 'leaflet' {
  export namespace L {
    type Map = any;
    type Marker = any;
    type Circle = any;
    type LayerGroup = any;
    type Layer = any;
    type TileLayer = any;
    type LatLng = any;
    type DivIcon = any;
    type LeafletEvent = any;
    type LeafletMouseEvent = any;
  }
  const L: any;
  export default L;
  export = L;
}
