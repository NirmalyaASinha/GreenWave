import { useState, useEffect } from 'react'

export const useCountUp = (target, duration = 500) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count === target) return

    const startTime = Date.now()
    const start = count

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const value = start + (target - start) * progress

      setCount(Math.floor(value))

      if (progress === 1) {
        clearInterval(interval)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [target, duration, count])

  return count
}
