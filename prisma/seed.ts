import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hash(pw, 10);

// ─── Ifrane-area coordinates ─────────────────────────────────────────────────
// Ifrane center: 33.5228° N, -5.1086° W
// AUI: 33.5097, -5.1026
// Tight spread within ~3km of city center

function jitter(base: number, range: number) {
  return base + (Math.random() - 0.5) * 2 * range;
}

const IFRANE_POINTS = [
  { lat: 33.5228, lng: -5.1086, name: "Town Center" },
  { lat: 33.5097, lng: -5.1026, name: "AUI Campus" },
  { lat: 33.5300, lng: -5.1200, name: "Royal Palace Area" },
  { lat: 33.5180, lng: -5.0950, name: "East Ifrane" },
  { lat: 33.5350, lng: -5.1050, name: "North Ifrane" },
  { lat: 33.5150, lng: -5.1300, name: "West Ifrane" },
  { lat: 33.5060, lng: -5.1150, name: "South Ifrane" },
  { lat: 33.5250, lng: -5.0800, name: "Cedar Forest Edge" },
  { lat: 33.5400, lng: -5.1100, name: "Ifrane Lake" },
  { lat: 33.5200, lng: -5.1400, name: "Rue Principale" },
];

function randomCoord() {
  const base = IFRANE_POINTS[Math.floor(Math.random() * IFRANE_POINTS.length)];
  return { lat: jitter(base.lat, 0.008), lng: jitter(base.lng, 0.008) };
}

const ISSUE_TYPES = [
  "Pothole", "Broken Streetlight", "Illegal Dumping",
  "Damaged Sidewalk", "Fallen Tree", "Graffiti", "Water Leak",
  "Clogged Drain", "Damaged Road Sign", "Broken Bench",
  "Vandalism", "Dead Animal", "Noise Complaint", "Overgrown Vegetation",
  "Damaged Fence", "Missing Manhole Cover", "Flooded Road", "Other",
];

const DESCRIPTIONS: Record<string, string[]> = {
  "Pothole": [
    "Large pothole on the main road, about 40cm wide and 10cm deep. Dangerous for cyclists.",
    "Multiple potholes near the school entrance after last week's rain.",
    "Deep pothole causing damage to vehicle tires. Urgent repair needed.",
  ],
  "Broken Streetlight": [
    "Streetlight has been out for 3 days. The alley is completely dark at night.",
    "Two consecutive lights broken near the mosque. Safety hazard.",
    "Flickering streetlight keeping neighbors awake all night.",
  ],
  "Illegal Dumping": [
    "Someone dumped construction waste near the cedar forest path.",
    "Large pile of household garbage left on the sidewalk for over a week.",
    "Mattresses and old furniture dumped near the park entrance.",
  ],
  "Damaged Sidewalk": [
    "Cracked tiles causing trip hazard, especially for elderly residents.",
    "Raised sidewalk edge near bus stop — dangerous for wheelchairs.",
    "Sidewalk completely missing for 10 meters. Pedestrians forced onto road.",
  ],
  "Fallen Tree": [
    "Large cedar branch fell overnight blocking the bike path.",
    "Tree uprooted by wind is partially blocking the road.",
    "Dead tree fell on the fence — needs immediate removal.",
  ],
  "Graffiti": [
    "Graffiti tags on the new community center wall.",
    "Inappropriate graffiti on school boundary wall.",
    "Multiple tags appeared overnight on the bridge underpass.",
  ],
  "Water Leak": [
    "Water gushing from broken pipe under the road for 2 days.",
    "Continuous leak from fire hydrant wasting water.",
    "Water pooling from underground leak near the market.",
  ],
  "Clogged Drain": [
    "Drain completely blocked with leaves — flooding risk during rain.",
    "Gutter overflowing onto the sidewalk.",
    "Main drain clogged causing street flooding.",
  ],
  "Damaged Road Sign": [
    "Stop sign knocked down, dangerous intersection.",
    "Speed limit sign bent and illegible.",
    "No parking sign missing — causing chaos.",
  ],
  "Broken Bench": [
    "Park bench with missing plank — injury risk for children.",
    "Bench near the fountain completely collapsed.",
    "Bench support broken, whole structure unstable.",
  ],
  "Vandalism": [
    "Public bathroom mirrors smashed.",
    "Phone booth damaged, glass shattered.",
    "Bus shelter roof torn off.",
  ],
  "Dead Animal": [
    "Dead dog on sidewalk near elementary school.",
    "Dead cat in gutter near residential area.",
    "Animal carcass near the forest entrance trail.",
  ],
  "Noise Complaint": [
    "Construction work starting at 5am every day for 2 weeks.",
    "Loud music from café until 3am on weekdays.",
    "Industrial generator running all night near residential zone.",
  ],
  "Overgrown Vegetation": [
    "Bushes blocking street visibility at dangerous corner.",
    "Tree branches overhanging road — hit trucks twice this week.",
    "Weeds completely covering sidewalk for 50 meters.",
  ],
  "Damaged Fence": [
    "School perimeter fence broken — children escaping easily.",
    "Park fence bent and sharp edges exposed.",
    "Fence around electrical substation damaged.",
  ],
  "Missing Manhole Cover": [
    "Manhole cover missing — serious injury risk for pedestrians.",
    "Open drainage hole in middle of sidewalk, no warning sign.",
  ],
  "Flooded Road": [
    "Road completely flooded after 30 minutes of rain.",
    "Intersection floods every time it rains — chronic problem.",
  ],
  "Other": [
    "General maintenance needed in this area.",
    "Multiple small issues in this zone requiring attention.",
    "Area needs general clean-up and inspection.",
  ],
};

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800",
  "https://images.unsplash.com/photo-1617803369408-e37e6b8aa0a0?w=800",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800",
  "https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=800",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800",
  "https://images.unsplash.com/photo-1564419431703-0d5a12e4b7de?w=800",
];

function randomImage() {
  return DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];
}

function randomType() {
  return ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
}

function randomDesc(type: string) {
  const pool = DESCRIPTIONS[type] ?? DESCRIPTIONS["Other"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 14) + 7);
  return d;
}

async function main() {
  console.log("🌱 Seeding MyIfrane...");

  // ─── Admins ───────────────────────────────────────────────────────────────
  const admin1 = await prisma.user.upsert({
    where: { email: "admin@myifrane.com" },
    update: {},
    create: {
      name: "MyIfrane Admin",
      email: "admin@myifrane.com",
      password: await hash("password"),
      role: "ADMIN",
      approved: true,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "admin@aui.ma" },
    update: {},
    create: {
      name: "AUI Admin",
      email: "admin@aui.ma",
      password: await hash("password"),
      role: "ADMIN",
      approved: true,
    },
  });

  console.log("✓ Admins created");

  // ─── Workers ──────────────────────────────────────────────────────────────
  const WORKER_DATA = [
    { name: "Youssef Benali", email: "youssef@workers.ma", approved: true, notes: "5 years experience in public works, certified in road maintenance." },
    { name: "Fatima Zahra El Idrissi", email: "fatima@workers.ma", approved: true, notes: "Expert in water infrastructure and drainage systems." },
    { name: "Mohammed Alami", email: "mohammed@workers.ma", approved: true, notes: "Electrician with 8 years experience. Specialized in street lighting." },
    { name: "Hassan Ouazzani", email: "hassan@workers.ma", approved: true, notes: "Tree surgeon and urban landscaping expert." },
    { name: "Rachid Tazi", email: "rachid@workers.ma", approved: true, notes: "General maintenance. Available 24/7 for emergencies." },
    { name: "Khalid Berrada", email: "khalid@workers.ma", approved: true, notes: "Road construction specialist, 10+ years." },
    { name: "Aicha Bennani", email: "aicha@workers.ma", approved: true, notes: "Sanitation expert, urban cleanliness coordinator." },
    { name: "Omar El Fassi", email: "omar@workers.ma", approved: true, notes: "Civil engineer, specializes in infrastructure repair." },
    { name: "Nadia Chaoui", email: "nadia@workers.ma", approved: true, notes: "Environmental maintenance and green space management." },
    { name: "Samir Lahlou", email: "samir@workers.ma", approved: true, notes: "Plumber and hydraulics specialist." },
    { name: "Zineb Kettani", email: "zineb@workers.ma", approved: true, notes: "Urban planning and road marking expert." },
    { name: "Amine Sebti", email: "amine@workers.ma", approved: false, notes: "Recent construction graduate. Looking to gain experience." },
    { name: "Maryam Boutaleb", email: "maryam@workers.ma", approved: false, notes: "I spoke with the coordinator last Thursday, we agreed I'd join." },
    { name: "Tariq El Amrani", email: "tariq@workers.ma", approved: false, notes: "5 years working in maintenance for private company, ready to serve the city." },
    { name: "Soukaina Bennis", email: "soukaina@workers.ma", approved: false },
  ];

  const workers = await Promise.all(
    WORKER_DATA.map(async (w) =>
      prisma.user.upsert({
        where: { email: w.email },
        update: {},
        create: {
          name: w.name,
          email: w.email,
          password: await hash("password"),
          role: "WORKER",
          approved: w.approved,
          workerNotes: w.notes,
        },
      })
    )
  );

  console.log(`✓ ${workers.length} workers created`);

  // ─── Citizens ─────────────────────────────────────────────────────────────
  const CITIZEN_DATA = [
    { name: "Layla Idrissi", email: "layla@citizens.ma" },
    { name: "Hamid Chraibi", email: "hamid@citizens.ma" },
    { name: "Sara El Malki", email: "sara@citizens.ma" },
    { name: "Karim Bensalah", email: "karim@citizens.ma" },
    { name: "Nour El Houda", email: "nour@citizens.ma" },
    { name: "Younes Filali", email: "younes@citizens.ma" },
    { name: "Rim Bensouda", email: "rim@citizens.ma" },
    { name: "Adil Kabbaj", email: "adil@citizens.ma" },
    { name: "Imane Sefrioui", email: "imane@citizens.ma" },
    { name: "Mehdi Gharbi", email: "mehdi@citizens.ma" },
    { name: "Houda Mestari", email: "houda@citizens.ma" },
    { name: "Zakaria Alaoui", email: "zakaria@citizens.ma" },
    { name: "Salma Benjelloun", email: "salma@citizens.ma" },
    { name: "Bilal El Hachimi", email: "bilal@citizens.ma" },
    { name: "Meriem Tahir", email: "meriem@citizens.ma" },
    { name: "Anas Ouahabi", email: "anas@citizens.ma" },
    { name: "Hajar Berrada", email: "hajar@citizens.ma" },
    { name: "Ilias Guessous", email: "ilias@citizens.ma" },
    { name: "Asma Cherkaoui", email: "asma@citizens.ma" },
    { name: "Othmane Belkadi", email: "othmane@citizens.ma" },
    { name: "Fatima Ait Omar", email: "fatima.citizen@citizens.ma" },
    { name: "Yassine El Mekkaoui", email: "yassine@citizens.ma" },
    { name: "Leila Raiss", email: "leila@citizens.ma" },
    { name: "Taha Benchekroun", email: "taha@citizens.ma" },
    { name: "Widad Naciri", email: "widad@citizens.ma" },
  ];

  const citizens = await Promise.all(
    CITIZEN_DATA.map(async (c) =>
      prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: {
          name: c.name,
          email: c.email,
          password: await hash("password"),
          role: "USER",
          approved: false,
        },
      })
    )
  );

  console.log(`✓ ${citizens.length} citizens created`);

  // ─── Issues ───────────────────────────────────────────────────────────────
  const approvedWorkers = workers.filter((w) => w.approved);
  const allReporters = [...citizens, ...workers.slice(0, 5)];

  const ISSUE_COUNT = 160;
  let created = 0;

  for (let i = 0; i < ISSUE_COUNT; i++) {
    const type = randomType();
    const desc = randomDesc(type);
    const coord = randomCoord();
    const reporter = allReporters[Math.floor(Math.random() * allReporters.length)];
    const daysAgo = Math.floor(Math.random() * 90) + 1;
    const createdAt = randomDate(daysAgo);

    // Distribute statuses: 30% OPEN, 20% ASSIGNED, 35% COMPLETED, 15% CANCELLED
    const roll = Math.random();
    let status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
    let worker = null;

    if (roll < 0.30) {
      status = "OPEN";
    } else if (roll < 0.50) {
      status = "ASSIGNED";
      worker = approvedWorkers[Math.floor(Math.random() * approvedWorkers.length)];
    } else if (roll < 0.85) {
      status = "COMPLETED";
      worker = approvedWorkers[Math.floor(Math.random() * approvedWorkers.length)];
    } else {
      status = "CANCELLED";
    }

    const rewardPoints = status === "COMPLETED" && Math.random() > 0.4
      ? Math.floor(Math.random() * 4) * 25 + 25
      : null;

    try {
      await prisma.issue.create({
        data: {
          type,
          description: desc,
          imageUrl: randomImage(),
          latitude: coord.lat,
          longitude: coord.lng,
          status,
          reportedById: reporter.id,
          assignedToId: worker?.id ?? null,
          completionImageUrl: status === "COMPLETED" ? randomImage() : null,
          rewardPoints,
          createdAt,
          updatedAt: status === "COMPLETED" || status === "CANCELLED"
            ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 3600000)
            : createdAt,
        },
      });
      created++;
    } catch (e) {
      // skip duplicates / constraint errors
    }
  }

  console.log(`✓ ${created} issues created`);
  console.log("\n📋 Login credentials:");
  console.log("  admin@myifrane.com / password (Admin)");
  console.log("  admin@aui.ma / password (Admin)");
  console.log("  youssef@workers.ma / password (Worker, approved)");
  console.log("  amine@workers.ma / password (Worker, pending)");
  console.log("  layla@citizens.ma / password (Citizen)");
  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
