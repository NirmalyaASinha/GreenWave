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
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
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
