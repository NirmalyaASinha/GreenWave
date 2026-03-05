import { useState, useEffect, useRef } from 'react'

export function useCountUp(end, duration = 1000) {
  const [count, setCount] = useState(0)
  const prevEndRef = useRef(end)

  useEffect(() => {
    // Only animate if the end value increases
    if (end <= prevEndRef.current && count !== 0) {
      setCount(end)
      prevEndRef.current = end
      return
    }

    prevEndRef.current = end
    
    const startTime = Date.now()
    const startValue = count

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      const currentCount = Math.floor(startValue + (end - startValue) * easeProgress)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  return count
}
