"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

type IssuePinData = {
  id: string;
  lat: number;
  lng: number;
  status: string;
  type: string;
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#3b82f6",
  ASSIGNED: "#f59e0b",
  COMPLETED: "#16a34a",
  CANCELLED: "#9ca3af",
};

type MapViewProps = {
  issues?: IssuePinData[];
  center?: [number, number];
  zoom?: number;
  height?: number;
  single?: { lat: number; lng: number; status?: string };
};

export default function MapView({ issues, center, zoom = 14, height = 360, single }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<unknown>(null);

  const defaultCenter: [number, number] = center ?? [33.5228, -5.1086];

  useEffect(() => {
    if (!mapRef.current) return;

    let map: import("leaflet").Map;
    let L: typeof import("leaflet");

    (async () => {
      L = (await import("leaflet")).default;

      // Fix Leaflet default icon path broken by webpack
      // @ts-expect-error: internal leaflet property
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (instanceRef.current) {
        (instanceRef.current as import("leaflet").Map).remove();
      }

      map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true });
      instanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (single) {
        const color = STATUS_COLORS[single.status ?? "OPEN"] ?? "#6b7280";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([single.lat, single.lng], { icon }).addTo(map);
        map.setView([single.lat, single.lng], zoom);
        return;
      }

      if (issues && issues.length > 0) {
        const bounds: [number, number][] = [];
        issues.forEach((issue) => {
          const color = STATUS_COLORS[issue.status] ?? "#6b7280";
          const icon = L.divIcon({
            className: "",
            html: `<div title="${issue.type}" style="width:13px;height:13px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.28);cursor:pointer"></div>`,
            iconSize: [13, 13],
            iconAnchor: [6, 6],
          });
          const marker = L.marker([issue.lat, issue.lng], { icon }).addTo(map);
          marker.bindPopup(
            `<div style="font-family:system-ui,sans-serif;min-width:120px">
              <strong style="font-size:13px">${issue.type}</strong><br/>
              <span style="color:${color};font-size:11px;font-weight:600">${issue.status}</span><br/>
              <a href="/issues/${issue.id}" style="font-size:11px;color:#15803d;text-decoration:underline;margin-top:4px;display:inline-block">View issue →</a>
            </div>`,
            { maxWidth: 200 }
          );
          bounds.push([issue.lat, issue.lng]);
        });
        if (bounds.length === 1) {
          map.setView(bounds[0], zoom);
        } else {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } else {
        map.setView(defaultCenter, zoom);
      }
    })();

    return () => {
      if (instanceRef.current) {
        (instanceRef.current as import("leaflet").Map).remove();
        instanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(issues), JSON.stringify(single), JSON.stringify(center), zoom]);

  return (
    <div className="rounded-xl overflow-hidden border border-border dark:border-neutral-700" style={{ height }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
