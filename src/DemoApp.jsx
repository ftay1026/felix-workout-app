import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Dumbbell, Timer, CheckCircle2, Circle, ChevronLeft, ChevronRight, TrendingUp, Home } from 'lucide-react'
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
  ],
  "CARDIO": [
    { name: "Rowing Machine", baseWeight: "N/A", baseReps: "20min", baseSets: 1, tempo: "HIIT", rest: "END", type: "cardio" },
    { name: "Bike Intervals", baseWeight: "N/A", baseReps: "15min", baseSets: 1, tempo: "HIIT", rest: "END", type: "cardio" },
    { name: "Incline Walk", baseWeight: "N/A", baseReps: "30min", baseSets: 1, tempo: "STEADY", rest: "END", type: "cardio" }
  ]
}

// Workout schedule
const workoutSchedule = {
  1: ["SHOULDERS", "BICEPS", "TRICEPS", "CARDIO"], // Monday/Thursday
  2: ["SHOULDERS", "BICEPS", "TRICEPS", "CARDIO"], // Tuesday/Friday  
  3: ["LEGS", "CORE", "CARDIO"], // Wednesday/Saturday
  4: ["CHEST", "BACK", "CARDIO"], // Monday/Thursday
  5: ["SHOULDERS", "BICEPS", "TRICEPS", "CARDIO"], // Tuesday/Friday
  6: ["LEGS", "CORE", "CARDIO"], // Wednesday/Saturday
  0: [] // Sunday - Rest
}

function DemoApp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [completedSets, setCompletedSets] = useState({})
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Get all exercises in a flat array for progress tracking
  const allExercises = Object.values(exercises).flat()

  // Rest timer effect
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

  // Calculate progression
  const calculateProgression = (exercise, date) => {
    const startDate = new Date('2025-08-19')
    const daysDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(daysDiff / 7) + 1
    const weekInCycle = ((weekNumber - 1) % 4) + 1
    const phase = Math.floor((weekNumber - 1) / 13) + 1

    let weight = exercise.baseWeight
    let reps = exercise.baseReps
    let sets = exercise.baseSets

    // Phase adjustments
    if (phase >= 2 && (exercise.type === "isolation" && (exercise.name.includes("Curl") || exercise.name.includes("Extension") || exercise.name.includes("Pressdown")))) {
      sets += 1
    }

    // Weekly progression
    if (weekInCycle === 2) {
      reps += 1
    } else if (weekInCycle === 3) {
      if (exercise.type === "compound") {
        weight += 2.5
      } else if (exercise.type === "isolation") {
        weight += 1.25
      }
    } else if (weekInCycle === 4) {
      weight *= 0.8
      weight = Math.round(weight * 4) / 4
    }

    return { weight, reps, sets, phase, week: weekNumber }
  }

  // Format time for timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleSetComplete = (exerciseName, setIndex) => {
    const key = `${exerciseName}-${setIndex}`
    const isCompleted = completedSets[key]
    
    if (isCompleted) {
      setCompletedSets(prev => {
        const newSets = { ...prev }
        delete newSets[key]
        return newSets
      })
    } else {
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
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
    setCompletedSets({}) // Reset completed sets for new date
  }

  // Get today's workout
  const dayOfWeek = currentDate.getDay()
  const todaysExerciseGroups = workoutSchedule[dayOfWeek] || []
  const todaysExercises = todaysExerciseGroups.flatMap(group => 
    exercises[group]?.map(ex => ({ ...ex, group })) || []
  )

  const isRestDay = todaysExercises.length === 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <CardTitle className="text-2xl">Felix's 12-Month Workout</CardTitle>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <div className="font-semibold">{currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                <div className="text-sm text-muted-foreground">
                  Week {calculateProgression(allExercises[0], currentDate).week} • Phase {calculateProgression(allExercises[0], currentDate).phase}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isRestDay ? (
              <div className="text-center py-8">
                <Home className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">Rest Day</h3>
                <p className="text-muted-foreground">Take a well-deserved break and let your muscles recover!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {todaysExerciseGroups.map(group => (
                  <div key={group}>
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">{group}</h3>
                    <div className="space-y-3">
                      {exercises[group]?.map(exercise => {
                        const progression = calculateProgression(exercise, currentDate)
                        return (
                          <Card key={exercise.name} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">{exercise.name}</h4>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline">{exercise.type}</Badge>
                                  {progression.phase > 1 && exercise.type === "isolation" && 
                                   (exercise.name.includes("Curl") || exercise.name.includes("Extension") || exercise.name.includes("Pressdown")) && (
                                    <Badge variant="secondary">+1 Set (Phase {progression.phase})</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-medium">
                                  {typeof progression.weight === 'number' ? `${progression.weight}kg` : progression.weight} × {progression.reps} × {progression.sets}
                                </div>
                                <div className="text-muted-foreground">
                                  {exercise.tempo} • {exercise.rest}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {Array.from({ length: progression.sets }, (_, setIndex) => {
                                const key = `${exercise.name}-${setIndex}`
                                const isCompleted = completedSets[key]
                                return (
                                  <Button
                                    key={setIndex}
                                    variant={isCompleted ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleSetComplete(exercise.name, setIndex)}
                                    className="flex items-center gap-1"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      <Circle className="h-4 w-4" />
                                    )}
                                    Set {setIndex + 1}
                                  </Button>
                                )
                              })}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rest Timer */}
            {isTimerRunning && (
              <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-2">
                    <Timer className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-semibold">Rest Timer: {formatTime(restTimer)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mt-6 flex-wrap">
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                <Calendar className="h-4 w-4 mr-1" />
                Today
              </Button>
              <Button variant="outline" onClick={() => setCompletedSets({})}>
                Reset Sets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DemoApp

