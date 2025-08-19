import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Minus, 
  StickyNote, 
  Timer,
  TrendingUp,
  TrendingDown,
  Minus as Equal
} from 'lucide-react'

const ExerciseCard = ({ 
  exercise, 
  progression, 
  completedSets, 
  onSetComplete, 
  onWeightChange, 
  onRepsChange, 
  onNotesChange,
  actualPerformance = {},
  onStartRestTimer 
}) => {
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notes, setNotes] = useState(actualPerformance.notes || '')
  const [actualWeights, setActualWeights] = useState(
    actualPerformance.weights || Array(progression.sets).fill(progression.weight)
  )
  const [actualReps, setActualReps] = useState(
    actualPerformance.reps || Array(progression.sets).fill(progression.reps)
  )
  
  const weightIntervalRef = useRef(null)
  const repsIntervalRef = useRef(null)

  // Handle weight adjustment with hold-to-run functionality
  const adjustWeight = (setIndex, delta, isHolding = false) => {
    const newWeights = [...actualWeights]
    const currentWeight = typeof newWeights[setIndex] === 'number' ? newWeights[setIndex] : 0
    const newWeight = Math.max(0, currentWeight + delta)
    newWeights[setIndex] = Math.round(newWeight * 4) / 4 // Round to nearest 0.25kg
    setActualWeights(newWeights)
    
    if (onWeightChange) {
      onWeightChange(exercise.name, setIndex, newWeight)
    }

    if (isHolding) {
      weightIntervalRef.current = setTimeout(() => {
        adjustWeight(setIndex, delta, true)
      }, 150) // Repeat every 150ms when holding
    }
  }

  // Handle reps adjustment
  const adjustReps = (setIndex, delta, isHolding = false) => {
    const newReps = [...actualReps]
    const currentReps = typeof newReps[setIndex] === 'number' ? newReps[setIndex] : 0
    const newRepCount = Math.max(0, currentReps + delta)
    newReps[setIndex] = newRepCount
    setActualReps(newReps)
    
    if (onRepsChange) {
      onRepsChange(exercise.name, setIndex, newRepCount)
    }

    if (isHolding) {
      repsIntervalRef.current = setTimeout(() => {
        adjustReps(setIndex, delta, true)
      }, 200) // Repeat every 200ms when holding
    }
  }

  // Stop hold-to-run intervals
  const stopWeightAdjustment = () => {
    if (weightIntervalRef.current) {
      clearTimeout(weightIntervalRef.current)
      weightIntervalRef.current = null
    }
  }

  const stopRepsAdjustment = () => {
    if (repsIntervalRef.current) {
      clearTimeout(repsIntervalRef.current)
      repsIntervalRef.current = null
    }
  }

  // Handle set completion
  const handleSetComplete = (setIndex) => {
    onSetComplete(exercise.name, setIndex)
    
    // Start rest timer if set is completed
    const key = `${exercise.name}-${setIndex}`
    const isCompleted = completedSets[key]
    
    if (!isCompleted && exercise.rest && exercise.rest !== 'END') {
      const restSeconds = exercise.rest.includes('min') ? parseInt(exercise.rest) * 60 : parseInt(exercise.rest)
      if (restSeconds > 0 && onStartRestTimer) {
        onStartRestTimer(restSeconds)
      }
    }
  }

  // Handle notes save
  const handleNotesSave = () => {
    if (onNotesChange) {
      onNotesChange(exercise.name, notes)
    }
    setShowNotesModal(false)
  }

  // Get performance indicator for a set
  const getPerformanceIndicator = (setIndex) => {
    const actualWeight = actualWeights[setIndex]
    const actualRepCount = actualReps[setIndex]
    const expectedWeight = progression.weight
    const expectedReps = progression.reps

    // Skip indicator for bodyweight exercises or if no actual data
    if (typeof expectedWeight !== 'number' || typeof actualWeight !== 'number') {
      return null
    }

    const weightDiff = actualWeight - expectedWeight
    const repsDiff = actualRepCount - expectedReps

    // Determine overall performance
    if (weightDiff > 0 || (weightDiff === 0 && repsDiff > 0)) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (weightDiff < 0 || (weightDiff === 0 && repsDiff < 0)) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    } else {
      return <Equal className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{exercise.name}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotesModal(true)}
                className="h-6 w-6 p-0"
              >
                <StickyNote className="h-4 w-4" />
              </Button>
            </div>
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
        
        {/* Sets with performance tracking */}
        <div className="space-y-3">
          {Array.from({ length: progression.sets }, (_, setIndex) => {
            const key = `${exercise.name}-${setIndex}`
            const isCompleted = completedSets[key]
            const performanceIndicator = getPerformanceIndicator(setIndex)
            
            return (
              <div key={setIndex} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSetComplete(setIndex)}
                      className="flex items-center gap-1"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      Set {setIndex + 1}
                    </Button>
                    {performanceIndicator}
                  </div>
                </div>
                
                {/* Weight adjustment */}
                {typeof progression.weight === 'number' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium w-12">Weight:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onMouseDown={() => adjustWeight(setIndex, -0.25, true)}
                      onMouseUp={stopWeightAdjustment}
                      onMouseLeave={stopWeightAdjustment}
                      onTouchStart={() => adjustWeight(setIndex, -0.25, true)}
                      onTouchEnd={stopWeightAdjustment}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-mono w-16 text-center">
                      {actualWeights[setIndex]}kg
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onMouseDown={() => adjustWeight(setIndex, 0.25, true)}
                      onMouseUp={stopWeightAdjustment}
                      onMouseLeave={stopWeightAdjustment}
                      onTouchStart={() => adjustWeight(setIndex, 0.25, true)}
                      onTouchEnd={stopWeightAdjustment}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {/* Reps adjustment */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12">Reps:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onMouseDown={() => adjustReps(setIndex, -1, true)}
                    onMouseUp={stopRepsAdjustment}
                    onMouseLeave={stopRepsAdjustment}
                    onTouchStart={() => adjustReps(setIndex, -1, true)}
                    onTouchEnd={stopRepsAdjustment}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-mono w-16 text-center">
                    {actualReps[setIndex]}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onMouseDown={() => adjustReps(setIndex, 1, true)}
                    onMouseUp={stopRepsAdjustment}
                    onMouseLeave={stopRepsAdjustment}
                    onTouchStart={() => adjustReps(setIndex, 1, true)}
                    onTouchEnd={stopRepsAdjustment}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Exercise Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {exercise.name}
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Equipment substitutions, form notes, etc..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleNotesSave} className="flex-1">
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNotesModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ExerciseCard

