"use client";

// Simple map display using an OpenStreetMap iframe — no API key required.
export default function IssueMap({ lat, lng }: { lat: number; lng: number }) {
  const zoom = 16;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 h-52 w-full">
      <iframe
        src={src}
        width="100%"
        height="100%"
        title="Issue location"
        className="border-0"
        loading="lazy"
      />
    </div>
  );
}
