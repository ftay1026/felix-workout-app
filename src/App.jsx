import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Dumbbell, Timer, CheckCircle2, Circle, ChevronLeft, ChevronRight, TrendingUp, Home, LogOut } from 'lucide-react'
import ProgressView from './components/ProgressView.jsx'
import AuthForm from './components/AuthForm.jsx'
import { supabase } from './lib/supabase.js'
import { saveCompletedSet, loadCompletedSets, removeCompletedSet } from './lib/database.js'
import './App.css'

// Workout data structure
const exercises = {
  "SHOULDERS": [
    { name: "DB Lateral Raises", baseWeight: 7.5, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Barbell Shoulder Press", baseWeight: 40, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" }
  ],
  "BICEPS": [
    { name: "Cable Hammer Curls", baseWeight: 20, baseReps: 12, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Barbell Curls", baseWeight: 27.5, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "21s (Biceps)", baseWeight: 15, baseReps: 21, baseSets: 1, tempo: "7-7-7", rest: "90s", type: "isolation" }
  ],
  "TRICEPS": [
    { name: "Overhead Cable Extension", baseWeight: 25, baseReps: 12, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Triceps Pressdown", baseWeight: 32.5, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Diamond Push-ups", baseWeight: "BW", baseReps: "FAIL", baseSets: 1, tempo: "2-2", rest: "END", type: "bodyweight" }
  ],
  "CHEST": [
    { name: "Cable Flies", baseWeight: 15, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Bench Press", baseWeight: 55, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Incline DB Press", baseWeight: 20, baseReps: 10, baseSets: 2, tempo: "4-4", rest: "90s", type: "compound" },
    { name: "Dips", baseWeight: "BW", baseReps: 10, baseSets: 2, tempo: "3-3", rest: "90s", type: "bodyweight" }
  ],
  "BACK": [
    { name: "Straight-Arm Pulldowns", baseWeight: 25, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Lat Pulldown", baseWeight: 42.5, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Bent-Over Row", baseWeight: 40, baseReps: 10, baseSets: 2, tempo: "4-4", rest: "90s", type: "compound" }
  ],
  "LEGS": [
    { name: "Leg Extensions", baseWeight: 30, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Leg Press", baseWeight: 65, baseReps: 10, baseSets: 1, tempo: "5-5", rest: "3min", type: "compound" },
    { name: "Lying Leg Curls", baseWeight: 25, baseReps: 12, baseSets: 3, tempo: "3-3", rest: "90s", type: "isolation" },
    { name: "Romanian Deadlifts", baseWeight: 50, baseReps: 10, baseSets: 2, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Standing Calf Raises", baseWeight: 40, baseReps: 20, baseSets: 3, tempo: "2-2", rest: "60s", type: "isolation" }
  ],
  "CORE": [
    { name: "Plank", baseWeight: "BW", baseReps: "30s", baseSets: 2, tempo: "HOLD", rest: "2min", type: "bodyweight" },
    { name: "Russian Twists", baseWeight: 10, baseReps: "30s", baseSets: 2, tempo: "FAST", rest: "0s", type: "isolation" },
    { name: "Leg Raises", baseWeight: "BW", baseReps: "30s", baseSets: 2, tempo: "SLOW", rest: "0s", type: "bodyweight" }
  ]
}

const workoutSplit = {
  "Mon": ["CHEST", "BACK"],
  "Tue": ["SHOULDERS", "BICEPS", "TRICEPS"],
  "Wed": ["LEGS", "CORE"],
  "Thu": ["CHEST", "BACK"],
  "Fri": ["SHOULDERS", "BICEPS", "TRICEPS"],
  "Sat": ["LEGS", "CORE"]
}

const cardioSchedule = {
  "Mon": { name: "Rowing", duration: "15 min", protocol: "1 min hard / 2 min moderate" },
  "Tue": { name: "Bike", duration: "10 min", protocol: "30 sec sprint / 90 sec easy" },
  "Wed": { name: "Incline Walk", duration: "20 min", protocol: "5% grade, 4.5 km/h" },
  "Thu": { name: "Rowing", duration: "15 min", protocol: "1 min hard / 2 min moderate" },
  "Fri": { name: "Bike", duration: "10 min", protocol: "30 sec sprint / 90 sec easy" },
  "Sat": { name: "Incline Walk", duration: "20 min", protocol: "5% grade, 4.5 km/h" }
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [completedSets, setCompletedSets] = useState({})
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentView, setCurrentView] = useState('workout') // 'workout' or 'progress'
  
  // Authentication state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const startDate = new Date(2025, 7, 19) // Aug 19, 2025

  // Get all exercises in a flat array for progress tracking
  const allExercises = Object.values(exercises).flat()

  // Check authentication state on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Set a timeout for the authentication check
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 10000)
        )
        
        const authPromise = supabase.auth.getSession()
        
        const { data: { session } } = await Promise.race([authPromise, timeoutPromise])
        setUser(session?.user ?? null)
      } catch (error) {
        console.log('Auth check failed or timed out:', error.message)
        // Continue without authentication if there's an error
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          // Load completed sets when user signs in
          await loadUserCompletedSets(session.user.id, currentDate)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load completed sets when date changes
  useEffect(() => {
    const loadUserCompletedSets = async (userId, date) => {
      try {
        const completedSets = await loadCompletedSets(userId, date)
        const setsMap = {}
        completedSets.forEach(set => {
          const key = `${set.exercise_name}-${set.set_index}`
          setsMap[key] = true
        })
        setCompletedSets(setsMap)
      } catch (error) {
        console.error('Error loading completed sets:', error)
      }
    }

    if (user && user.id !== 'demo-user') {
      loadUserCompletedSets(user.id, currentDate)
    } else if (user && user.id === 'demo-user') {
      // Reset completed sets for demo user when date changes
      setCompletedSets({})
    }
  }, [currentDate, user])

  // Authentication functions
  const handleSignIn = async (email, password) => {
    setLoading(true)
    setAuthError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      setAuthError(error.message)
    }
    setLoading(false)
  }

  const handleSignUp = async (email, password) => {
    setLoading(true)
    setAuthError('')
    
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) {
      setAuthError(error.message)
    } else {
      setAuthError('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setCompletedSets({})
    setCurrentView('workout')
  }

  // Show auth form if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="mb-4">Loading...</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setLoading(false)
              setUser(null)
            }}
            className="text-sm"
          >
            Skip Authentication (Demo Mode)
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <AuthForm 
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          loading={loading}
          error={authError}
        />
        <div className="flex-1 flex items-end justify-center pb-8">
          <Button 
            variant="ghost" 
            onClick={() => {
              console.log('Demo mode clicked')
              setUser({ id: 'demo-user', email: 'demo@example.com' })
            }}
            className="text-sm text-muted-foreground"
          >
            Continue without account (Demo Mode)
          </Button>
        </div>
      </div>
    )
  }

  // Add error boundary for demo mode
  try {

  // Calculate progression
  const calculateProgression = (exercise, date) => {
    const daysDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24))
    const weekNum = Math.floor(daysDiff / 7) + 1
    const weekInCycle = ((weekNum - 1) % 4) + 1
    
    let weight = exercise.baseWeight
    let reps = exercise.baseReps
    let sets = exercise.baseSets

    // Apply monthly progression
    const monthsPassed = Math.floor(weekNum / 4)
    if (typeof weight === 'number') {
      if (exercise.type === "compound") {
        weight += monthsPassed * 5
      } else if (exercise.type === "isolation") {
        weight += monthsPassed * 2.5
      }
    }

    // Apply weekly progression
    if (weekInCycle === 2 && typeof reps === 'number') {
      reps += 1
    } else if (weekInCycle === 3 && typeof weight === 'number') {
      if (exercise.type === "compound") {
        weight += 2.5
      } else if (exercise.type === "isolation") {
        weight += 1.25
      }
    } else if (weekInCycle === 4 && typeof weight === 'number') {
      weight = Math.round(weight * 0.8 * 10) / 10
    }

    // Phase adjustments
    const phase = weekNum <= 12 ? 1 : (weekNum <= 24 ? 2 : (weekNum <= 36 ? 3 : 4))
    if (phase >= 2 && (exercise.name.includes("Bicep") || exercise.name.includes("Tricep") || exercise.name.includes("Shoulder"))) {
      if (typeof sets === 'number') sets += 1
    }

    return { weight, reps, sets, tempo: exercise.tempo, rest: exercise.rest }
  }

  // Get current workout
  const getCurrentWorkout = () => {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' })
    if (dayName === 'Sun') return null

    const muscleGroups = workoutSplit[dayName] || []
    const workout = []

    muscleGroups.forEach(group => {
      if (exercises[group]) {
        exercises[group].forEach(exercise => {
          const progression = calculateProgression(exercise, currentDate)
          workout.push({
            ...exercise,
            group,
            ...progression
          })
        })
      }
    })

    return {
      exercises: workout,
      cardio: cardioSchedule[dayName] || null
    }
  }

  // Timer functionality
  useEffect(() => {
    let interval = null
    if (isTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(timer => timer - 1)
      }, 1000)
    } else if (restTimer === 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, restTimer])

  const startRestTimer = (restTime) => {
    const seconds = restTime === "30s" ? 30 : 
                   restTime === "60s" ? 60 :
                   restTime === "90s" ? 90 :
                   restTime === "2min" ? 120 :
                   restTime === "3min" ? 180 : 0
    
    if (seconds > 0) {
      setRestTimer(seconds)
      setIsTimerRunning(true)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleSetComplete = async (exerciseName, setIndex) => {
    const key = `${exerciseName}-${setIndex}`
    const isCompleted = completedSets[key]
    
    if (isCompleted) {
      // Remove from cloud and local state (skip cloud if demo user)
      if (user.id !== 'demo-user') {
        await removeCompletedSet(user.id, currentDate, exerciseName, setIndex)
      }
      setCompletedSets(prev => {
        const newSets = { ...prev }
        delete newSets[key]
        return newSets
      })
    } else {
      // Add to cloud and local state (skip cloud if demo user)
      if (user.id !== 'demo-user') {
        await saveCompletedSet(user.id, currentDate, exerciseName, setIndex)
      }
      setCompletedSets(prev => ({ ...prev, [key]: true }))
      
      // Start rest timer
      const exercise = allExercises.find(ex => ex.name === exerciseName)
      if (exercise && exercise.rest) {
        const restSeconds = exercise.rest === 'END' ? 0 : 
                          exercise.rest.includes('min') ? parseInt(exercise.rest) * 60 :
                          parseInt(exercise.rest)
        if (restSeconds > 0) {
          setRestTimer(restSeconds)
          setIsTimerRunning(true)
        }
      }
    }
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    do {
      newDate.setDate(newDate.getDate() + direction)
    } while (newDate.getDay() === 0) // Skip Sundays
    setCurrentDate(newDate)
    setCompletedSets({}) // Reset completed sets for new day
  }

  const workout = getCurrentWorkout()
  const dateStr = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' })
  const dayColor = dayName === 'Sun' ? 'gray' :
                  ['Mon', 'Thu'].includes(dayName) ? 'red' :
                  ['Tue', 'Fri'].includes(dayName) ? 'blue' :
                  ['Wed', 'Sat'].includes(dayName) ? 'green' : 'gray'

  // Render progress view
  if (currentView === 'progress') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Progress View Header */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => setCurrentView('workout')}>
                  <Home className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-lg">Progress Tracking</CardTitle>
                  <p className="text-sm text-muted-foreground">Your strength journey</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          <ProgressView exercises={allExercises} startDate={startDate} />
        </div>
      </div>
    )
  }

  // Render workout view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Workout View Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-lg">Felix's Workout</CardTitle>
                <p className="text-sm text-muted-foreground">{dateStr}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Badge variant={dayColor === 'gray' ? 'secondary' : 'default'} 
                   className={`mt-2 ${dayColor === 'red' ? 'bg-red-100 text-red-800' : 
                                      dayColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                                      dayColor === 'green' ? 'bg-green-100 text-green-800' : ''}`}>
              {dayName === 'Sun' ? 'REST DAY' :
               ['Mon', 'Thu'].includes(dayName) ? 'CHEST & BACK' :
               ['Tue', 'Fri'].includes(dayName) ? 'SHOULDERS & ARMS' :
               ['Wed', 'Sat'].includes(dayName) ? 'LEGS & CORE' : 'REST DAY'}
            </Badge>
          </CardHeader>
        </Card>

        {/* Rest Timer */}
        {isTimerRunning && restTimer > 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Timer className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-mono font-bold text-orange-600">
                {formatTime(restTimer)}
              </div>
              <p className="text-sm text-orange-600">Rest Time</p>
            </CardContent>
          </Card>
        )}

        {/* Workout Content */}
        {dayName === 'Sun' ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Rest Day</h3>
              <p className="text-muted-foreground">Take a well-deserved break! Recovery is just as important as training.</p>
            </CardContent>
          </Card>
        ) : workout && (
          <>
            {/* Exercises */}
            {workout.exercises.map((exercise, exerciseIndex) => (
              <Card key={`${exercise.group}-${exercise.name}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{exercise.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {exercise.group}
                      </Badge>
                    </div>
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-sm mb-4">
                    <div className="text-center">
                      <div className="font-semibold">{exercise.weight}{typeof exercise.weight === 'number' ? 'kg' : ''}</div>
                      <div className="text-muted-foreground">Weight</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{exercise.reps}</div>
                      <div className="text-muted-foreground">Reps</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{exercise.tempo}</div>
                      <div className="text-muted-foreground">Tempo</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{exercise.rest}</div>
                      <div className="text-muted-foreground">Rest</div>
                    </div>
                  </div>
                  
                  {/* Sets */}
                  <div className="space-y-2">
                    {Array.from({ length: exercise.sets }, (_, setIndex) => (
                      <div key={setIndex} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Set {setIndex + 1}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toggleSetComplete(exercise.name, setIndex)
                              if (exercise.rest !== "END" && exercise.rest !== "0s") {
                                startRestTimer(exercise.rest)
                              }
                            }}
                          >
                            {completedSets[`${exercise.name}-${setIndex}`] ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Cardio */}
            {workout.cardio && (
              <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-base text-orange-700 dark:text-orange-300">
                    Cardio: {workout.cardio.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Duration:</span>
                      <span className="text-sm font-semibold">{workout.cardio.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Protocol:</span>
                      <span className="text-sm font-semibold">{workout.cardio.protocol}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" onClick={() => setCompletedSets({})}>
                Reset Sets
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('progress')}>
                <TrendingUp className="h-4 w-4 mr-1" />
                Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
  } catch (error) {
    console.error('App rendering error:', error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Error: {error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Reload App
          </Button>
        </div>
      </div>
    )
  }
}

export default App

