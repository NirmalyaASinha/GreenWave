import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function seedFirestore() {
  try {
    console.log('Starting to seed Firestore...');

    // Request Collection
    const requestsRef = collection(db, 'Request');
    const requests = [
      { type: 'medical', status: 'pending', cun_lat: 23.0395, cun_lng: 72.5830, timestamp: new Date() },
      { type: 'fire', status: 'approved', cun_lat: 23.0456, cun_lng: 72.5711, timestamp: new Date() },
      { type: 'police', status: 'pending', cun_lat: 23.0225, cun_lng: 72.5714, timestamp: new Date() },
      { type: 'traffic', status: 'approved', cun_lat: 23.0304, cun_lng: 72.5633, timestamp: new Date() },
      { type: 'accident', status: 'pending', cun_lat: 23.0367, cun_lng: 72.5845, timestamp: new Date() },
      { type: 'medical', status: 'resolved', cun_lat: 23.0288, cun_lng: 72.5756, timestamp: new Date() }
    ];

    for (const req of requests) {
      await addDoc(requestsRef, req);
      console.log(`Added request: ${req.type}`);
    }

    // History Collection
    const historyRef = collection(db, 'History');
    const history = [
      { type: 'medical', status: 'completed', cun_lat: 23.0395, cun_lng: 72.5830, duration_min: 12, time_saved_min: 6, timestamp: new Date() },
      { type: 'fire', status: 'completed', cun_lat: 23.0456, cun_lng: 72.5711, duration_min: 18, time_saved_min: 9, timestamp: new Date() },
      { type: 'police', status: 'completed', cun_lat: 23.0225, cun_lng: 72.5714, duration_min: 15, time_saved_min: 7, timestamp: new Date() },
      { type: 'accident', status: 'completed', cun_lat: 23.0367, cun_lng: 72.5845, duration_min: 20, time_saved_min: 10, timestamp: new Date() }
    ];

    for (const item of history) {
      await addDoc(historyRef, item);
      console.log(`Added history: ${item.type}`);
    }

    // Vehicles Collection
    const vehiclesRef = collection(db, 'Vehicles');
    const vehicles = [
      { name: 'Ambulance 01', type: 'ambulance', cun_lat: 23.0325, cun_lng: 72.5750, speed: 65, is_active: true, has_corridor: true, status: 'on_duty' },
      { name: 'Fire Truck 01', type: 'fire', cun_lat: 23.0370, cun_lng: 72.5680, speed: 58, is_active: true, has_corridor: true, status: 'on_duty' },
      { name: 'Police Car 01', type: 'police', cun_lat: 23.0250, cun_lng: 72.5720, speed: 72, is_active: true, has_corridor: false, status: 'on_duty' },
      { name: 'Ambulance 02', type: 'ambulance', cun_lat: 23.0280, cun_lng: 72.5800, speed: 0, is_active: false, has_corridor: false, status: 'standby' }
    ];

    for (const vehicle of vehicles) {
      await addDoc(vehiclesRef, vehicle);
      console.log(`Added vehicle: ${vehicle.name}`);
    }

    console.log('Firestore seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    return false;
  }
}
