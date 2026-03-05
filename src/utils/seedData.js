import { collection, addDoc } from "firebase/firestore"
import { db } from "../config/firebase"

export async function seedFirestore() {

  // ── REQUEST COLLECTION ──────────────────────────
  const requests = [
    { type: "medical",  status: "pending",  cun_lat: "23.0395", cun_lng: "72.5830" },
    { type: "fire",     status: "approved", cun_lat: "23.0284", cun_lng: "72.5728" },
    { type: "police",   status: "pending",  cun_lat: "23.0587", cun_lng: "72.5812" },
    { type: "traffic",  status: "resolved", cun_lat: "23.0421", cun_lng: "72.6012" },
    { type: "accident", status: "rejected", cun_lat: "23.0634", cun_lng: "72.6198" },
    { type: "medical",  status: "approved", cun_lat: "23.0298", cun_lng: "72.5987" },
  ]

  // ── HISTORY COLLECTION ──────────────────────────
  const history = [
    { type: "medical",  status: "completed", cun_lat: "23.0395", cun_lng: "72.5830", duration_min: 12, time_saved_min: 6  },
    { type: "fire",     status: "completed", cun_lat: "23.0284", cun_lng: "72.5728", duration_min: 8,  time_saved_min: 4  },
    { type: "police",   status: "completed", cun_lat: "23.0587", cun_lng: "72.5812", duration_min: 15, time_saved_min: 7  },
    { type: "accident", status: "completed", cun_lat: "23.0421", cun_lng: "72.6012", duration_min: 10, time_saved_min: 5  },
  ]

  // ── VEHICLES COLLECTION ─────────────────────────
  const vehicles = [
    { name: "Ambulance 01",  type: "ambulance", cun_lat: 23.0395, cun_lng: 72.5830, speed: 65, is_active: true,  has_corridor: true,  status: "on_duty"  },
    { name: "Fire Truck 01", type: "fire",      cun_lat: 23.0284, cun_lng: 72.5728, speed: 45, is_active: true,  has_corridor: false, status: "on_duty"  },
    { name: "Police 01",     type: "police",    cun_lat: 23.0587, cun_lng: 72.5812, speed: 70, is_active: true,  has_corridor: true,  status: "on_duty"  },
    { name: "Ambulance 02",  type: "ambulance", cun_lat: 23.0634, cun_lng: 72.6198, speed: 0,  is_active: false, has_corridor: false, status: "standby"  },
  ]

  try {
    // Add Requests
    for (const req of requests) {
      await addDoc(collection(db, "Request"), req)
      console.log("✅ Request added:", req.type)
    }

    // Add History
    for (const hist of history) {
      await addDoc(collection(db, "History"), hist)
      console.log("✅ History added:", hist.type)
    }

    // Add Vehicles
    for (const vehicle of vehicles) {
      await addDoc(collection(db, "Vehicles"), vehicle)
      console.log("✅ Vehicle added:", vehicle.name)
    }

    console.log("🎉 All data seeded successfully!")
    return true

  } catch (error) {
    console.error("❌ Seed failed:", error.message)
    return false
  }
}