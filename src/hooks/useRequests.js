import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { firestore } from '../config/firebase'

export function useRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const requestsQuery = query(collection(firestore, 'Request'))
    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        setRequests(
          snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              type: data.type,
              status: data.status,
              cun_lat: Number(data.cun_lat),
              cun_lng: Number(data.cun_lng),
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

  return { requests, loading, error }
}
