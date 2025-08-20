import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Dumbbell, Timer, CheckCircle2, Circle, ChevronLeft, ChevronRight, TrendingUp, Home, BarChart3 } from 'lucide-react'
import ExerciseCard from './components/ExerciseCard.jsx'
import ProgressView from './components/ProgressView.jsx'
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
  const [activeTab, setActiveTab] = useState('workout') // 'workout' or 'progress'
  
  // Performance tracking state
  const [actualPerformance, setActualPerformance] = useState({})
  // Structure: { "exerciseName": { weights: [7.5, 7.5], reps: [15, 12], notes: "Used 6kg instead" } }
  
  // Load performance data from localStorage on component mount
  useEffect(() => {
    const dateKey = currentDate.toISOString().split('T')[0]
    const savedData = localStorage.getItem(`workout-performance-${dateKey}`)
    if (savedData) {
      setActualPerformance(JSON.parse(savedData))
    } else {
      setActualPerformance({})
    }
  }, [currentDate])

  // Save performance data to localStorage whenever it changes
  useEffect(() => {
    const dateKey = currentDate.toISOString().split('T')[0]
    if (Object.keys(actualPerformance).length > 0) {
      localStorage.setItem(`workout-performance-${dateKey}`, JSON.stringify(actualPerformance))
    }
  }, [actualPerformance, currentDate])

  // Auto-adjustment logic for future workouts
  const getAdjustedProgression = (exercise, date) => {
    const baseProgression = calculateProgression(exercise, date)
    
    // Look for previous performance data to adjust weights
    const previousWorkouts = getPreviousWorkoutData(exercise.name, date)
    if (previousWorkouts.length === 0) {
      return baseProgression
    }

    // Analyze recent performance (last 2-3 workouts)
    const recentPerformance = previousWorkouts.slice(-3)
    const adjustmentFactor = calculateAdjustmentFactor(recentPerformance, exercise)
    
    // Apply adjustment while maintaining timeline
    let adjustedWeight = baseProgression.weight
    if (typeof adjustedWeight === 'number') {
      adjustedWeight = Math.max(0, adjustedWeight + adjustmentFactor)
      adjustedWeight = Math.round(adjustedWeight * 4) / 4 // Round to nearest 0.25kg
    }

    return {
      ...baseProgression,
      weight: adjustedWeight,
      isAdjusted: adjustmentFactor !== 0
    }
  }

  // Get previous workout data for an exercise
  const getPreviousWorkoutData = (exerciseName, currentDate) => {
    const workouts = []
    const checkDate = new Date(currentDate)
    
    // Look back up to 4 weeks for previous instances of this exercise
    for (let i = 1; i <= 28; i++) {
      checkDate.setDate(checkDate.getDate() - 1)
      const dateKey = checkDate.toISOString().split('T')[0]
      const savedData = localStorage.getItem(`workout-performance-${dateKey}`)
      
      if (savedData) {
        const dayData = JSON.parse(savedData)
        if (dayData[exerciseName]) {
          workouts.push({
            date: new Date(checkDate),
            performance: dayData[exerciseName]
          })
        }
      }
    }
    
    return workouts.reverse() // Return in chronological order
  }

  // Calculate adjustment factor based on recent performance
  const calculateAdjustmentFactor = (recentPerformance, exercise) => {
    if (recentPerformance.length === 0) return 0
    
    let totalAdjustment = 0
    let adjustmentCount = 0
    
    recentPerformance.forEach(workout => {
      const { weights, reps } = workout.performance
      if (!weights || !reps) return
      
      // Calculate performance vs expected for each set
      weights.forEach((actualWeight, setIndex) => {
        const actualReps = reps[setIndex]
        if (typeof actualWeight !== 'number' || typeof actualReps !== 'number') return
        
        const expectedWeight = exercise.baseWeight
        const expectedReps = exercise.baseReps
        
        if (typeof expectedWeight !== 'number' || typeof expectedReps !== 'number') return
        
        // Performance analysis
        const weightDiff = actualWeight - expectedWeight
        const repsDiff = actualReps - expectedReps
        
        // Determine adjustment needed
        if (actualReps < expectedReps * 0.75) {
          // Significant underperformance - reduce weight
          totalAdjustment -= (exercise.type === 'compound' ? 2.5 : 1.25)
        } else if (actualReps >= expectedReps && weightDiff >= 0) {
          // Met or exceeded expectations - small increase
          totalAdjustment += (exercise.type === 'compound' ? 1.25 : 0.625)
        } else if (actualReps < expectedReps * 0.9) {
          // Minor underperformance - small decrease
          totalAdjustment -= (exercise.type === 'compound' ? 1.25 : 0.625)
        }
        
        adjustmentCount++
      })
    })
    
    // Average the adjustments and cap them
    const avgAdjustment = adjustmentCount > 0 ? totalAdjustment / adjustmentCount : 0
    return Math.max(-5, Math.min(5, avgAdjustment)) // Cap between -5kg and +5kg
  }

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
    }
  }

  // Performance tracking handlers
  const handleWeightChange = (exerciseName, setIndex, newWeight) => {
    setActualPerformance(prev => {
      const exerciseData = prev[exerciseName] || { weights: [], reps: [], notes: '' }
      const newWeights = [...exerciseData.weights]
      newWeights[setIndex] = newWeight
      
      return {
        ...prev,
        [exerciseName]: {
          ...exerciseData,
          weights: newWeights
        }
      }
    })
  }

  const handleRepsChange = (exerciseName, setIndex, newReps) => {
    setActualPerformance(prev => {
      const exerciseData = prev[exerciseName] || { weights: [], reps: [], notes: '' }
      const newRepsArray = [...exerciseData.reps]
      newRepsArray[setIndex] = newReps
      
      return {
        ...prev,
        [exerciseName]: {
          ...exerciseData,
          reps: newRepsArray
        }
      }
    })
  }

  const handleNotesChange = (exerciseName, notes) => {
    setActualPerformance(prev => {
      const exerciseData = prev[exerciseName] || { weights: [], reps: [], notes: '' }
      
      return {
        ...prev,
        [exerciseName]: {
          ...exerciseData,
          notes: notes
        }
      }
    })
  }

  const startRestTimer = (seconds) => {
    setRestTimer(seconds)
    setIsTimerRunning(true)
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
    setCompletedSets({}) // Reset completed sets for new date
    // Performance data will be loaded automatically by useEffect
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
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 justify-center">
          <Button
            variant={activeTab === 'workout' ? 'default' : 'outline'}
            onClick={() => setActiveTab('workout')}
            className="flex items-center gap-2"
          >
            <Dumbbell className="h-4 w-4" />
            Workout
          </Button>
          <Button
            variant={activeTab === 'progress' ? 'default' : 'outline'}
            onClick={() => setActiveTab('progress')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Progress
          </Button>
        </div>

        {/* Conditional Tab Content */}
        {activeTab === 'progress' ? (
          <ProgressView />
        ) : (
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
                        const progression = getAdjustedProgression(exercise, currentDate)
                        const exercisePerformance = actualPerformance[exercise.name] || {}
                        
                        return (
                          <div key={exercise.name}>
                            <ExerciseCard
                              exercise={exercise}
                              progression={progression}
                              completedSets={completedSets}
                              onSetComplete={toggleSetComplete}
                              onWeightChange={handleWeightChange}
                              onRepsChange={handleRepsChange}
                              onNotesChange={handleNotesChange}
                              actualPerformance={exercisePerformance}
                              onStartRestTimer={startRestTimer}
                            />
                            {progression.isAdjusted && (
                              <div className="text-xs text-blue-600 mt-1 ml-4">
                                ⚡ Weight adjusted based on your recent performance
                              </div>
                            )}
                          </div>
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
        )}
      </div>
    </div>
  )
}

export default DemoApp

