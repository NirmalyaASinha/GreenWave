import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { firestore } from '../config/firebase'

export function useHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const historyQuery = query(collection(firestore, 'History'))
    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        setHistory(
          snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              cun_lat: data.cun_lat ? Number(data.cun_lat) : undefined,
              cun_lng: data.cun_lng ? Number(data.cun_lng) : undefined,
              duration_min: data.duration_min ? Number(data.duration_min) : undefined,
              time_saved_min: data.time_saved_min ? Number(data.time_saved_min) : undefined,
            }
          }),
        )
        setLoading(false)
        setError(null)
      },
      (nextError) => {
        setError(nextError.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  return { history, loading, error }
}
